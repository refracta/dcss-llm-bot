const data = {};
for (const d of data) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    window.open(d.href.replace('/w/', '/edit/'), '_blank');
}
