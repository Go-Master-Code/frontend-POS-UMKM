import api from "./index";

// get all roles
export function getRoles() {
    return api.get("/roles");
}

// get role by ID
export function getRoleByID(id) {
    return api.get(`roles/${id}`);
}

// create new role
export function createRole(payload) {
    return api.post("/roles", payload);
}

// delete role
export function deleteRole(id) {
    return api.delete(`/roles/${id}`);
}

// udpate role
export function updateRole(id, payload) {
    return api.put(`/roles/${id}`, payload);
}