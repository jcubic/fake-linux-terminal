const dom = require('dom');

async function main() {
    if (!await dom.exists('.vi')) {
        await dom.load('/lib/vi/vi.js');
        await dom.load('/lib/vi/vi.css');
        await dom.inject('<textarea class="vi"></textarea>');
    }
    return 0;
}
