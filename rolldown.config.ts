import { defineConfig } from 'rolldown';

const removeCommentsPlugin = {
    name: 'remove-comments',
    renderChunk(code: string) {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/#region.*\n?/g, '')
            .replace(/\/\/#endregion\n?/g, '')
            .replace(/\n{3,}/g, '\n\n');
    },
};

export default defineConfig({
    input: 'src/index.tsx',
    external: [/^react(\/.*)?$/, 'react-native', 'clsx', 'tailwind-merge'],
    output: {
        file: 'dist/index.js',
        format: 'esm',
    },
    plugins: [removeCommentsPlugin],
});
