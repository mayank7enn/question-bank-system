import { useContext, useEffect, useState } from "react";
import { appContext } from "../../context/appContext";

export const RolesManagement = () => {
    const context = useContext(appContext);
    if (!context) {
        throw new Error("RolesList must be used within an AppContextProvider");
    }
    const { backendUrl } = context;

    // State for roles and new role input
    const [roles, setRoles] = useState<{ _id: string; role: string }[]>([]);
    const [newRole, setNewRole] = useState<string>("");

    // Fetch roles from the backend
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/module/role`, {
                    method: "GET",
                    credentials: "include", // ✅ Ensures cookies are sent
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch roles");
                }

                setRoles(data.roles); // ✅ Fix: Use `data.roles` based on API response
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchRoles();
    }, [backendUrl]);

    // Delete role function
    const deleteRole = async (roleName: string): Promise<void> => {
        try {
            const response = await fetch(`${backendUrl}/api/module/role`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // ✅ Ensure cookies are sent
                body: JSON.stringify({ role: roleName }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to delete role");

            setRoles((prevRoles) => prevRoles.filter((r) => r.role !== roleName));
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    // Add role function
    const addRole = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault(); // Prevent default form submission behavior

        if (!newRole.trim()) {
            alert("Role name cannot be empty");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/module/role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // ✅ Ensure cookies are sent
                body: JSON.stringify({ role: newRole }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to add role");

            // Add the new role to the roles state
            setRoles((prevRoles) => [...prevRoles, { _id: data._id, role: newRole }]);
            setNewRole(""); // Clear the input field
        } catch (error) {
            console.error("Error adding role:", error);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <form onSubmit={addRole} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Enter new role"
                    className="border border-gray-300 p-2 rounded-md flex-grow text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
                >
                    Add Role
                </button>
            </form>
            <h2 className="text-lg font-semibold mb-4 pt-10">Roles List</h2>

            {/* Roles List */}
            {roles.length === 0 ? (
                <p className="text-sm text-gray-600">No roles available.</p>
            ) : (
                <ul className="space-y-2">
                    {roles.map((role) => (
                        <li
                            key={role._id}
                            className="flex justify-between items-center p-2 border border-gray-200 rounded-md"
                        >
                            <span className="text-sm">{role.role}</span>
                            {/* <button
                                onClick={() => deleteRole(role.role)}
                                className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button> */}
                        </li>
                    ))}
                </ul>
            )}

            {/* Add Role Form */}
        </div>
    );
};