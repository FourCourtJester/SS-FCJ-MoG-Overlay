# Node image. Floating the patch inside the LTS line so rebuilds pick up security
# fixes; the major is pinned so every rebuild runs the same Node as the last one.
# Vite 8 needs Node 20.19+ or 22.12+, so 24 is comfortably inside it.
FROM node:24-bookworm

# Add default packages

RUN npm install -g npm-check-updates

# ffmpeg: the creator kit's video is 4K and its art up to 12558px wide. Everything
# that ships is cut down from it first (scripts/assets.sh), video and stills alike.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*
