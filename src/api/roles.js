import api from "./index";

// get all roles
export function getRoles() {
    return api.get("/roles");
}