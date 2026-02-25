// Anime Batch Downloader Extension for Gopeed
// Cara pakai:
// 1. Set JSON URL di settings extension
// 2. Buat task baru dengan URL apapun (trigger extension)
// 3. Extension otomatis fetch JSON dan queue semua episode

gopeed.events.onResolve(async (ctx) => {
  const jsonUrl = gopeed.settings.json_url;
  const saveDir = gopeed.settings.save_dir || "Initial D";

  // Kalau tidak ada JSON URL di settings, coba parse URL langsung
  let targetUrl = jsonUrl || ctx.req.url;

  // Cek apakah URL adalah file JSON
  if (!targetUrl.endsWith(".json")) {
    gopeed.logger.warn("Bukan file JSON, skip...");
    return;
  }

  gopeed.logger.info("Fetching JSON dari: " + targetUrl);

  try {
    // Fetch file JSON
    const resp = await fetch(targetUrl);
    if (!resp.ok) {
      gopeed.logger.error("Gagal fetch JSON: " + resp.status);
      return;
    }

    const episodes = await resp.json();

    if (!Array.isArray(episodes) || episodes.length === 0) {
      gopeed.logger.error("JSON kosong atau format salah!");
      return;
    }

    gopeed.logger.info("Ditemukan " + episodes.length + " episode");

    // Build file list untuk Gopeed
    const files = episodes.map((ep) => {
      return {
        name: ep.filename,
        path: saveDir,
        req: {
          url: ep.url,
          extra: {
            // Header agar tidak kena rate limit Archive.org
            header: {
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 13; Redmi K20 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
              "Accept-Encoding": "identity",
              Referer: "https://archive.org/",
            },
          },
        },
      };
    });

    // Set response ke Gopeed
    ctx.res = {
      name: saveDir,
      files: files,
    };

    gopeed.logger.info(
      "Berhasil! " + files.length + " episode siap didownload"
    );
  } catch (err) {
    gopeed.logger.error("Error: " + err.message);
  }
});
