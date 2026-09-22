// file ini untuk download langsung stock report saat menu di klik
export function downloadPdf(response, filename) {
    const blob = new Blob([response.data], {
        type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
}