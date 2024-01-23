const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.get('/image.png', async (req, res) => {
  try {
    const imageSources = [
      'https://2.img-dpreview.com/files/p/E~C1000x0S4000x4000T1200x1200~articles/3925134721/0266554465.jpeg',
      'https://fastly.picsum.photos/id/15/2500/1667.jpg?hmac=Lv03D1Y3AsZ9L2tMMC1KQZekBVaQSDc1waqJ54IHvo4',
      'https://fastly.picsum.photos/id/22/4434/3729.jpg?hmac=fjZdkSMZJNFgsoDh8Qo5zdA_nSGUAWvKLyyqmEt2xs0',
      'https://fastly.picsum.photos/id/28/4928/3264.jpg?hmac=GnYF-RnBUg44PFfU5pcw_Qs0ReOyStdnZ8MtQWJqTfA',
    ];

    const imageBuffers = await Promise.all(
      imageSources.map(async (url) => {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
      })
    );

    const images = await Promise.all(
      imageBuffers.map(async (buffer) => await sharp(buffer).resize(200, 200).toBuffer())
    );

    const resultImage = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })
      .composite([
        { input: images[0], top: 0, left: 0 },
        { input: images[1], top: 0, left: 200 },
        { input: images[2], top: 200, left: 0 },
        { input: images[3], top: 200, left: 200 },
      ])
      .png()
      .toBuffer();

    // download image
    // fs.writeFileSync('download-img.png', resultImage);

    res.type('png').send(resultImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
