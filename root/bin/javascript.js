const term = require('term');

async function main() {
    const name = await term.read('name: ');
    await term.echo(`Hello ${name}`);
    return 0;
}
