export const menuItems = [
    {
        key: "dashboard",
        label: "Dashboard",
        icon: "pi pi-home",
        route: "/",
    },
    {
        key: "master",
        label: "Master Data",
        icon: "pi pi-box",
        items: [
            {
                key: "catalog_category",
                label: "Catalog",
                icon: "pi pi-tags",
                route: "/catalog_category",
            },
            {
                key: "items",
                label: "Items",
                icon: "pi pi-box",
                route: "/catalog_item",
            },
            {
                label: "Item Variant",
                icon: "pi pi-tags",
                route: "/catalog/items/55555555-5555-5555-5555-555555555551/variants",
            },
            {
                key: "suppliers",
                label: "Suppliers",
                icon: "pi pi-truck",
                route: "/suppliers",
            },
            {
                key: "customers",
                label: "Customers",
                route: "/customers",
            },
            {
                key: "users",
                label: "Users",
                icon: "pi pi-users",
                route: "/users",
            },
        ],
    },
    {
        key: "purchase",
        label: "Purchase",
        icon: "pi pi-shopping-cart",
        items: [
            {
                key: "purchase-list",
                label: "Purchase",
                route: "/purchase",
            },
            {
                key: "purchase-return",
                label: "Purchase Return",
                route: "/purchase-return",
            },
        ],
    },
    {
        key: "sales",
        label: "Sales",
        icon: "pi pi-wallet",
        route: "/sales",
    },
    {
        key: "reports",
        label: "Reports",
        icon: "pi pi-chart-bar",
        items: [
            {
                key: "sales-report",
                label: "Sales Report",
                route: "/reports/sales",
            },
            {
                key: "purchase-report",
                label: "Purchase Report",
                route: "/reports/purchase",
            },
            {
                key: "stock-report",
                label: "Stock Report",
                route: "/reports/stock",
            },
        ],
    },
    {
        label: "Business Profile",
        icon: "pi pi-building",
        route: "/settings/business-profile",
    },
];