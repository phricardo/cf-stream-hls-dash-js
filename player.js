(async () => {
  const accountId = "";
  const apiToken = "";
  const videoId = "";
  const customerCode = "";

  try {
    // Fetch the playback token
    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const json = await resp.json();
    if (!json.success) throw new Error(JSON.stringify(json.errors));

    const token = json.result.token;

    // Build manifest URLs
    const hlsUrl = `https://customer-${customerCode}.cloudflarestream.com/${token}/manifest/video.m3u8`;
    const dashUrl = `https://customer-${customerCode}.cloudflarestream.com/${token}/manifest/video.mpd`;

    // Create the <video> element
    const videoEl = document.createElement("video");
    videoEl.controls = true;
    videoEl.autoplay = false;
    videoEl.playsInline = true;
    videoEl.width = 640;
    videoEl.height = 360;

    // Detect support and initialize the appropriate player
    if (videoEl.canPlayType("application/vnd.apple.mpegURL")) {
      // Native HLS support (Safari)
      videoEl.src = hlsUrl;
    } else if (Hls.isSupported()) {
      // HLS.js support
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoEl);
    } else if (dashjs.MediaPlayer.isSupported()) {
      // dash.js support
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoEl, dashUrl, false);
    } else {
      console.error("No support for HLS or DASH found.");
      alert("Your browser does not support HLS or DASH playback.");
      return;
    }

    // Append the video element into the container
    document.getElementById("video-container").appendChild(videoEl);
  } catch (e) {
    console.error("Error fetching or playing video:", e);
    alert("Failed to load video. See console for details.");
  }
})();
