#!/usr/bin/env python3
"""
Remove black background from video and output WebM with alpha channel.
Requires: pip install opencv-python numpy
Requires: ffmpeg installed (brew install ffmpeg)
"""

import cv2
import numpy as np
import subprocess
import tempfile
import shutil
import os
import sys

INPUT     = 'public/assets/arli-hai-5detik.mp4'
OUTPUT    = 'public/assets/arli-hai-nobg.webm'
THRESHOLD = 35   # 0-255: pixels darker than this on all channels = transparent
FEATHER   = 3    # blur radius for smooth edges (0 = no feathering)
TRIM_START = 1.0  # detik mulai
TRIM_END   = 3.056  # detik selesai

def process():
    cap = cv2.VideoCapture(INPUT)
    if not cap.isOpened():
        print(f'ERROR: Cannot open {INPUT}')
        sys.exit(1)

    fps    = cap.get(cv2.CAP_PROP_FPS)
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f'Video: {width}x{height} @ {fps:.1f}fps, {total} frames')

    tmpdir = tempfile.mkdtemp()
    print(f'Processing frames to {tmpdir}...')

    start_frame = int(TRIM_START * fps)
    end_frame   = int(TRIM_END   * fps)
    print(f'Trimming: frame {start_frame} – {end_frame} ({TRIM_START}s – {TRIM_END}s)')

    raw_idx = 0
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        raw_idx += 1
        if raw_idx <= start_frame:
            continue
        if raw_idx > end_frame:
            break

        # Build alpha mask: black pixels → transparent
        bgra = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
        gray = np.max(frame, axis=2)
        alpha = np.where(gray < THRESHOLD, 0, 255).astype(np.uint8)

        if FEATHER > 0:
            alpha = cv2.GaussianBlur(alpha, (FEATHER * 2 + 1, FEATHER * 2 + 1), 0)

        bgra[:, :, 3] = alpha
        cv2.imwrite(f'{tmpdir}/frame_{idx:05d}.png', bgra)
        idx += 1

        if idx % 10 == 0:
            print(f'  {idx} frames...', end='\r')

    cap.release()
    print(f'\nProcessed {idx} frames. Encoding WebM with alpha...')

    cmd = [
        'ffmpeg', '-y',
        '-framerate', str(fps),
        '-i', f'{tmpdir}/frame_%05d.png',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-b:v', '0',
        '-crf', '15',
        '-auto-alt-ref', '0',   # required for alpha
        OUTPUT
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    shutil.rmtree(tmpdir)

    if result.returncode != 0:
        print('ffmpeg error:')
        print(result.stderr[-2000:])
        sys.exit(1)

    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f'Done! → {OUTPUT} ({size_kb:.0f} KB)')
    print()
    print('Update App.tsx: ganti src ke /assets/arli-hai-nobg.webm')
    print('Dan hapus mixBlendMode: screen')

if __name__ == '__main__':
    process()
