async function main() {
    const name = await modules.term.read('name: ');
    await modules.term.pause();
    await modules.term.echo(`Hello ${name}`);
    await modules.term.resume();
    return 0;
}
