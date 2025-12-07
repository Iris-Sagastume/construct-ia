import { useEffect, useState } from "react";
import { apiHelper } from "../api";
import { useAuth } from "../context/AuthContext";

type UserProfile = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "CLIENTE" | "ADMIN";
  createdAt: string;
};

export default function Profile() {
  const { auth, setAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: auth.name || "",
    phone: auth.phone || "",
    avatarUrl: auth.photoUrl || "",
  });

  // Cargar perfil una sola vez
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!auth.email) {
          setError("Debes iniciar sesión para ver tu perfil.");
          setLoading(false);
          return;
        }

        const url = `/me?email=${encodeURIComponent(auth.email)}`;
        const data = await apiHelper.get<UserProfile>(url);

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          avatarUrl: data.avatarUrl || "",
        });

        setAuth({
          email: data.email,
          role: data.role,
          name: data.name || null,
          phone: data.phone || null,
          photoUrl: data.avatarUrl || null,
        });
      } catch (err) {
        console.error(err);
        setError(
          "No fue posible cargar tu perfil. Verifica que estás autenticado."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (!auth.email) {
        setError("Debes iniciar sesión para guardar tu perfil.");
        setSaving(false);
        return;
      }

      const url = `/me?email=${encodeURIComponent(auth.email)}`;
      const data = await apiHelper.put<UserProfile>(url, {
        name: form.name || null,
        phone: form.phone || null,
        avatarUrl: form.avatarUrl || null,
      });

      setAuth({
        email: data.email,
        role: data.role,
        name: data.name || null,
        phone: data.phone || null,
        photoUrl: data.avatarUrl || null,
      });

      alert("Perfil actualizado correctamente ✅");
    } catch (err) {
      console.error(err);
      setError("No fue posible guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  // Subir archivo para foto de perfil
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !auth.email) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      setError(null);

      const url = `/me/avatar?email=${encodeURIComponent(auth.email)}`;
      const data = await apiHelper.upload<UserProfile>(url, formData);

      setForm((f) => ({
        ...f,
        avatarUrl: data.avatarUrl || "",
      }));

      setAuth({
        email: data.email,
        role: data.role,
        name: data.name || null,
        phone: data.phone || null,
        photoUrl: data.avatarUrl || null,
      });
    } catch (err) {
      console.error(err);
      setError("No fue posible subir la foto de perfil.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const displayInitials =
    (form.name || auth.name || auth.email || "")
      .trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Encabezado similar a Contacto */}
      <section className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Perfil de usuario
        </h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
          Administre sus datos personales, teléfono de contacto y foto de
          perfil para mantener su cuenta actualizada.
        </p>
      </section>

      {loading ? (
        <p className="text-slate-600 text-center">Cargando perfil...</p>
      ) : (
        <section className="bg-white border border-slate-100 rounded-3xl shadow-lg px-6 py-8 md:px-10 md:py-10">
          <div className="grid md:grid-cols-[260px,1fr] gap-10 items-start">
            {/* Lado izquierdo: avatar y resumen, estilo tarjeta de info */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-semibold text-slate-700 overflow-hidden">
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayInitials
                )}
              </div>

              <div className="text-center md:text-left space-y-1">
                <p className="text-base md:text-lg font-semibold text-slate-900">
                  {form.name || auth.name || "Sin nombre"}
                </p>
                <p className="text-sm text-slate-500">
                  {auth.email || "sin-email"}
                </p>
                <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                  Rol: {auth.role || "CLIENTE"}
                </span>
              </div>
            </div>

            {/* Lado derecho: formulario, similar a la tarjeta de contacto */}
            <div className="md:w-full">
              {error && (
                <div className="mb-4 bg-red-50 text-red-800 px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={auth.email || ""}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2 md:col-start-1 md:col-end-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+504 9999-9999"
                    />
                  </div>
                </div>

                {/* URL manual de la imagen */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL foto de perfil
                  </label>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Puede pegar la URL de una imagen (por ejemplo, desde la
                    nube).
                  </p>
                </div>

                {/* Subir archivo desde la PC */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    O suba una imagen desde su dispositivo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="block w-full text-sm text-slate-700"
                  />
                  {uploading && (
                    <p className="mt-1 text-xs text-slate-500">
                      Subiendo imagen...
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

