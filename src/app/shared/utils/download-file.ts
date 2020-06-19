export class NewFile{

    data;
    fileName;

    constructor(data, fileName) {
        this.data = data;
        this.fileName = fileName;
    }

    download() {
        let a = document.createElement("a");
        document.body.appendChild(a);
        // let json = JSON.stringify(data);
        let blob = new Blob([this.data], {type: "octet/stream"});
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = this.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
}