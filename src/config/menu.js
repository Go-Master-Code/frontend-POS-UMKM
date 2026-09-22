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
        icon: "pi pi-database",
        items: [
            {
                key: "catalog_category",
                label: "Category",
                icon: "pi pi-tags",
                route: "/catalog_category",
            },
            {
                key: "items",
                label: "Items",
                icon: "pi pi-box",
                route: "/catalog_item",
            },
            // { MENU SHORTCUT KE ITEM VARIANT LANGSUNG => TAHAP DEVELOPMENT
            //     label: "Item Variant",
            //     icon: "pi pi-tags",
            //     route: "/catalog/items/55555555-5555-5555-5555-555555555551/variants",
            // },
            {
                key: "suppliers",
                label: "Suppliers",
                icon: "pi pi-truck",
                route: "/suppliers",
            },
            {
                key: "customers",
                label: "Customers",
                icon: "pi pi-users",
                route: "/customers",
            },
            {
                key: "users",
                label: "Users",
                icon: "pi pi-users",
                route: "/users",
            },
            {
                key: "roles",
                label: "Roles",
                icon: "pi pi-shield",
                route: "/roles",
            },
        ],
    },
    /* MENU PURCHASE SEMENTARA DI NONAKTIFKAN
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
    },*/
    {
        key: "expenses",
        label: "Expenses",
        icon: "pi pi-money-bill",
        route: "/expenses",
    },
    {
        key: "sales",
        label: "Sales",
        icon: "pi pi-wallet",
        route: "/sales",
    },
    {
        key: "unpaid_sales",
        label: "Unpaid Sales",
        icon: "pi pi-exclamation-circle",
        route: "/unpaid_sales",
    },
    {
        key: "reports",
        label: "Reports",
        icon: "pi pi-chart-bar",
        items: [
            {
                key: "sales_report",
                label: "Sales Report",
                route: "/reports/sales",
                icon: "pi pi-wallet",
            },
            /* REPORT SALES SEMENTARA DI NONAKTIFKAN
            {
                key: "purchase-report",
                label: "Purchase Report",
                route: "/reports/purchase",
            },
            */
            {
                key: "expense-report",
                label: "Expense Report",
                route: "/reports/expenses",
                icon: "pi pi-money-bill",
            },
            {
                key: "stock-report",
                label: "Stock Report",
                icon: "pi pi-box",
                action: "download-stock-report", // jangan pakai route, tapi pakai action karena mau langsung generate pdf
            },
        ],
    },
    {
        label: "Business Profile",
        icon: "pi pi-building",
        route: "/settings/business-profile",
    },
];