# 2Image - HTML to Image Converter

A powerful web-based tool for converting HTML content to various image formats. Built with Next.js and React.

![2Image Screenshot](https://example.com/screenshot.png)

## Features

- Convert HTML code to PNG, JPEG, and SVG formats
- Live preview of the rendered HTML
- Adjustable image settings (quality, pixel ratio, dimensions)
- File upload support for HTML and SVG files
- Background color customization
- Settings saved automatically to localStorage
- Responsive design for all devices

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [html-to-image](https://github.com/bubkoo/html-to-image) - Core conversion library
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/2image.git
   cd 2image
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Enter your HTML code in the editor
2. Customize image settings (format, quality, dimensions, background color)
3. View the live preview
4. Download the generated image in your preferred format

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [html-to-image](https://github.com/bubkoo/html-to-image) for the core conversion functionality
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
