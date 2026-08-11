# personal-site

## Structure

```
personal-site/
├── index.html            homepage — notebook intro + city map
├── writing.html
├── photography.html
├── bookshelf.html
├── closet.html
├── kitchen.html
├── css/
│   └── style.css         palette variables + @font-face live here
├── js/
│   └── main.js
└── assets/
    ├── fonts/             ← drop downloaded .woff2 files here
    ├── images/
    │   ├── city/           building PNGs for the map
    │   ├── bookshelf/       item PNGs
    │   ├── closet/          item PNGs
    │   ├── kitchen/         item PNGs
    │   ├── photography/     gallery images
    │   ├── notebook-frames/ the stop-motion open sequence
    │   └── textures/        index-card, paper-scrap, corkboard, surfaces
```

## Fonts

Headline: **Faculty Glyphic** (400 only). Body: **Newsreader** (400,
600, 400 italic). `css/style.css` already has the `@font-face` rules
wired up — you just need to get the files into `assets/fonts/` with
these exact names:

- `faculty-glyphic-regular.woff2`
- `newsreader-regular.woff2`
- `newsreader-semibold.woff2`
- `newsreader-italic.woff2`

### How to get them

1. Go to **gwfh.mranftl.com/fonts/faculty-glyphic** → check "regular
   400" → Download files → unzip → rename the `.woff2` file to
   `faculty-glyphic-regular.woff2`.
2. Go to **gwfh.mranftl.com/fonts/newsreader** → check "regular 400",
   "600", and "italic 400" → Download files → unzip → rename the
   three `.woff2` files to `newsreader-regular.woff2`,
   `newsreader-semibold.woff2`, and `newsreader-italic.woff2`.
3. Move all four files into `assets/fonts/`.
4. Open `index.html` in a browser (or right-click → Open With → your
   browser) to confirm the fonts load — headings should render in
   Faculty Glyphic, body text in Newsreader.

## Open in VS Code

File → Open Folder → select `personal-site`.
