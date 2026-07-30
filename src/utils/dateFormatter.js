/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
|
| Mengubah format:
|
| 2026-07-17
|
| menjadi
|
| 17 Jul
|
|--------------------------------------------------------------------------
*/

export function formatShortDate(dateString) {

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);

}