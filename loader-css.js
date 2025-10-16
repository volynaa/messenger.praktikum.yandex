// CSS loader for Mocha tests
export async function resolve(specifier, context, nextResolve) {
    // Check if the file is a CSS file
    if (specifier.endsWith('.css') || specifier.endsWith('.pcss')) {
        return {
            shortCircuit: true,
            url: 'data:text/javascript,export default {}'
        };
    }

    // Let Node.js handle all other specifiers
    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    // Check if the URL is a CSS file
    if (url.endsWith('.css') || url.endsWith('.pcss') || url.includes('main.pcss')) {
        return {
            format: 'module',
            shortCircuit: true,
            source: 'export default {};'
        };
    }

    // Let Node.js handle all other URLs
    return nextLoad(url, context);
}