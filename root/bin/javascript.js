const term = require('term');

async function main() {
    await term.echo('Hello, World');
    const name = await term.read('name: ');

    if (name) {
        await term.echo(`Hello ${name}`);
        return 0;
    }
    return 1;
}
