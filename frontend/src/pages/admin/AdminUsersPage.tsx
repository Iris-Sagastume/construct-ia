// src/pages/admin/AdminUsersPage.tsx
import { useEffect, useState } from "react";
import { apiHelper } from "../../api";

type UserRole =
  | "CLIENTE"
  | "ADMIN"
  | "CONSTRUCTORA"
  | "FERRETERIA"
  | "BANCO";

interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole | string;
  createdAt: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENTE: "Cliente",
  ADMIN: "Administrador",
  CONSTRUCTORA: "Constructora",
  FERRETERIA: "Ferretería",
  BANCO: "Banco",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiHelper.get<AdminUser[]>("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    try {
      setSavingId(userId);
      setError(null);
      setOk(null);

      const updated = await apiHelper.put<AdminUser>(
        `/admin/users/${userId}/role`,
        { role: newRole }
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
      setOk("Rol actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("No fue posible actualizar el rol.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 mt-10 mb-16">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
        Gestión de usuarios
      </h1>
      <p className="text-sm text-slate-500 mb-6 max-w-2xl">
        Aquí puedes consultar las cuentas registradas en Construct IA y
        modificar únicamente el rol asignado a cada usuario.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {ok && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 text-sm">
          {ok}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">ID</th>
              <th className="px-3 py-2 text-left font-semibold">Nombre</th>
              <th className="px-3 py-2 text-left font-semibold">Correo</th>
              <th className="px-3 py-2 text-left font-semibold">Teléfono</th>
              <th className="px-3 py-2 text-left font-semibold">Rol</th>
              <th className="px-3 py-2 text-left font-semibold">Creado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">
                    {u.name || <span className="text-slate-400">Sin nombre</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{u.email}</td>
                  <td className="px-3 py-2">
                    {u.phone || (
                      <span className="text-slate-400">Sin teléfono</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="border border-slate-300 rounded-full px-3 py-1 text-xs bg-white"
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) =>
                        handleChangeRole(u.id, e.target.value as UserRole)
                      }
                    >
                      {(
                        ["CLIENTE", "ADMIN", "CONSTRUCTORA", "FERRETERIA", "BANCO"] as UserRole[]
                      ).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleString("es-HN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
