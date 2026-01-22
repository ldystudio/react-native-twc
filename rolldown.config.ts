import { defineConfig } from 'rolldown';

const removeCommentsPlugin = {
    name: 'remove-comments',
    renderChunk(code: string) {
        return code
            .replace(/\/\*(?!\s*@__(?:PURE|NO_SIDE_EFFECTS)__\s*\*\/)[\s\S]*?\*\//g, '')
            .replace(/\/\/#region.*\n?/g, '')
            .replace(/\/\/#endregion\n?/g, '')
            .replace(/\n{3,}/g, '\n\n');
    },
};

export default defineConfig({
    input: 'src/index.tsx',
    external: ['react', /^react\//, 'react-native', 'clsx', 'tailwind-merge'],
    output: {
        file: 'dist/index.js',
        format: 'esm',
    },
    plugins: [removeCommentsPlugin],
});
