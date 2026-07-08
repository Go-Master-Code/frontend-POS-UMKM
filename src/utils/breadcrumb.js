/**
 * Mencari breadcrumb berdasarkan route.
 *
 * Parameter:
 * menu  -> daftar menu
 * path  -> route yang sedang dibuka
 *
 * Return:
 * Array breadcrumb
 */

export function findBreadcrumb(menu, path) {
    for (const item of menu) {
        // jika route ditemukan
        if (item.route === path) {
            return [item];
        }

        // jika memiliki submenu
        if (item.items) {
            const child = findBreadcrumb(item.items, path);

            if (child.length) {
                return [item, ...child];
            }
        }
    }
    
    return [];
}