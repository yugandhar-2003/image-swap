# AI Thumbnail Face Swap (Gemini)

Production-ready full-stack web app that swaps a portrait face into a thumbnail image using **Gemini API** with model **`gemini-3-pro-image-preview`**.

## Features

- Upload thumbnail + portrait image
- Optional prompt instructions
- Realistic face swap generation via Gemini
- Drag-and-drop support
- Input image previews
- Loader and robust error handling
- Download generated image
- In-memory recent history (last 10)

## Project Structure

```
.
├── server
│   ├── controllers
│   │   └── swapController.js
│   ├── routes
│   │   └── swapRoutes.js
│   └── index.js
├── public
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .env.example
└── package.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Edit `.env`:

```env
GEMINI_API_KEY=your_real_key
PORT=3000
```

## Run

### Production

```bash
npm start
```

### Development (auto reload)

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## API

### `POST /api/swap`

Multipart form-data fields:

- `thumbnail` (image, required)
- `portrait` (image, required)
- `instructions` (string, optional)

Returns:

```json
{
  "image": "data:image/png;base64,...",
  "history": []
}
```

## Notes

- Upload limit is 8MB per file.
- History is in-memory only and resets on server restart.
