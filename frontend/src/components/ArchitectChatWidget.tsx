import { useEffect, useState } from "react";
import { api } from "../api";

type HouseForm = {
  tipoCasa: string;
  areaVaras: string;
  habitaciones: string;
  banos: string;
  departamento: string;
  municipio: string;
  colonia: string;
  piscina: "SI" | "NO";
  notasAdicionales: string;
};

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
  imageUrl?: string;
};

type FlowStep =
  | "builder"
  | "house"
  | "quoteConfirm"
  | "ferreteria"
  | "bank"
  | "contact"
  | "ticket";

type ContactMode = "PRESENCIAL" | "VIRTUAL";

type ContactInfo = {
  email: string;
  phone: string;
  mode: ContactMode | null;
  place: string;
  virtualOption: "WhatsApp" | "Zoom" | "Google Meet" | "";
};

// 🔹 Lo que necesitamos de la tabla Solicitud
type SolicitudLite = {
  id: number;
  tipo: "CONSTRUCTORA" | "FERRETERIA" | "BANCO";
  nombre: string;
  tasaInteres: number | null;
  email: string;
  estado: string;
};

const HOUSE_STEPS = [
  {
    key: "tipoCasa",
    question:
      "Indíquenos, por favor, qué tipo de casa le interesa (por ejemplo: minimalista, moderna, rústica, tropical…).",
  },
  {
    key: "areaVaras",
    question:
      "¿De cuántas varas cuadradas aproximadamente desea que sea la vivienda? (por ejemplo: 200).",
  },
  {
    key: "habitaciones",
    question: "¿Cuántas habitaciones considera necesarias?",
  },
  {
    key: "banos",
    question: "¿Cuántos baños requiere el diseño de la vivienda?",
  },
  {
    key: "departamento",
    question:
      "¿En qué departamento de Honduras estaría ubicada la vivienda? (por ejemplo: Cortés, Francisco Morazán…).",
  },
  {
    key: "municipio",
    question: "¿En qué municipio se encontraría el proyecto?",
  },
  {
    key: "colonia",
    question:
      "¿En qué colonia o residencial le gustaría ubicar la vivienda? Puede indicarnos una de referencia.",
  },
  {
    key: "piscina",
    question:
      "¿Desea que la vivienda incluya piscina? (responda 'sí' o 'no').",
  },
  {
    key: "notasAdicionales",
    question:
      "¿Desea agregar algún detalle adicional importante (ventanales, cochera, área verde, etc.)? Si no, puede indicar 'no'.",
  },
] as const;

// 🔹 Listas de respaldo por si falla la API o no hay aliados aprobados
const FALLBACK_BUILDERS = ["Inversiones Acrópolis"];

const FALLBACK_FERRETERIAS = [
  "Ferretería Monterroso",
  "Sin preferencia de ferretería",
];

const FALLBACK_BANKS = [
  { name: "Banco Atlántida", rate: 9.5 },
  { name: "Sin preferencia de banco", rate: 0 },
];

function formatOptions(label: string, options: string[]) {
  const lines = options.map((opt, idx) => `${idx + 1}. ${opt}`);
  return `${label}\n${lines.join("\n")}`;
}

function chooseOption(input: string, options: string[]): string {
  const lower = input.trim().toLowerCase();
  const num = parseInt(lower, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
    return options[num - 1];
  }
  const found = options.find(
    (opt) => opt.toLowerCase() === lower || lower.includes(opt.toLowerCase())
  );
  return found ?? input;
}

function generateTicketNumber() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TCK-${random}`;
}

export default function ArchitectChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Aliados dinámicos desde la tabla Solicitud (solo APROBADAS)
  const [builders, setBuilders] = useState<string[]>(FALLBACK_BUILDERS);
  const [ferreterias, setFerreterias] = useState<string[]>([]);
  const [banks, setBanks] = useState<{ name: string; rate: number }[]>(
    FALLBACK_BANKS
  );

  // Versiones finales que usará el chat (con fallback y "sin preferencia")
  const buildersForChat = builders.length ? builders : FALLBACK_BUILDERS;

  const ferreteriasForChat = (() => {
    if (!ferreterias.length) return FALLBACK_FERRETERIAS;
    const hasDefault = ferreterias.some((f) =>
      f.toLowerCase().includes("sin preferencia")
    );
    return hasDefault
      ? ferreterias
      : [...ferreterias, "Sin preferencia de ferretería"];
  })();

  const banksForChat = banks.length ? banks : FALLBACK_BANKS;

  // 🔹 Cargar aliados aprobados al montar el widget
  useEffect(() => {
    async function loadAllies() {
      try {
        const { data } = await api.get<SolicitudLite[]>(
          "/solicitudes?estado=APROBADA"
        );

        const aprobadas = (data || []).filter(
          (s) => s.estado === "APROBADA"
        ) as SolicitudLite[];

        const buildersDb = aprobadas
          .filter((s) => s.tipo === "CONSTRUCTORA")
          .map((s) => s.nombre)
          .filter(Boolean);

        const ferreteriasDb = aprobadas
          .filter((s) => s.tipo === "FERRETERIA")
          .map((s) => s.nombre)
          .filter(Boolean);

        const banksDb = aprobadas
          .filter((s) => s.tipo === "BANCO")
          .map((s) => ({
            name: s.nombre,
            rate: s.tasaInteres ?? 0,
          }))
          .filter((b) => !!b.name);

        if (buildersDb.length) setBuilders(buildersDb);
        if (ferreteriasDb.length) setFerreterias(ferreteriasDb);

        if (banksDb.length) {
          const hasDefaultBank = banksDb.some((b) =>
            b.name.toLowerCase().includes("sin preferencia")
          );
          if (!hasDefaultBank) {
            banksDb.push({ name: "Sin preferencia de banco", rate: 0 });
          }
          setBanks(banksDb);
        }
      } catch (err) {
        console.error("[assistant] No fue posible cargar aliados aprobados:", err);
        // si falla, nos quedamos con los FALLBACK_*
      }
    }

    loadAllies();
  }, []);

  // 🔹 función global para abrir el asistente desde cualquier lado
  useEffect(() => {
    const openFn = () => setIsOpen(true);
    (window as any).openArchitectChat = openFn;

    return () => {
      if ((window as any).openArchitectChat === openFn) {
        delete (window as any).openArchitectChat;
      }
    };
  }, []);

  const [form, setForm] = useState<HouseForm>({
    tipoCasa: "",
    areaVaras: "",
    habitaciones: "",
    banos: "",
    departamento: "",
    municipio: "",
    colonia: "",
    piscina: "NO",
    notasAdicionales: "",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [flowStep, setFlowStep] = useState<FlowStep>("builder");
  const [currentHouseStep, setCurrentHouseStep] = useState(0);

  const [selectedBuilder, setSelectedBuilder] = useState<string | null>(null);
  const [selectedFerreteria, setSelectedFerreteria] = useState<string | null>(
    null
  );
  const [selectedBank, setSelectedBank] = useState<{
    name: string;
    rate: number;
  } | null>(null);

  const [contactPhase, setContactPhase] = useState<
    "email" | "phone" | "mode" | "place" | "virtualOption"
  >("email");

  const [contact, setContact] = useState<ContactInfo>({
    email: "",
    phone: "",
    mode: null,
    place: "",
    virtualOption: "",
  });

  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [lastDesignId, setLastDesignId] = useState<number | null>(null);

  const [lastEstimatedCost, setLastEstimatedCost] = useState<number | null>(
    null
  );

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return;

    const now = Date.now();

    const welcome: ChatMessage = {
      id: now,
      role: "assistant",
      content:
        "Bienvenido a Construct-IA. Soy su asistente virtual y le acompañaré en el proceso de pre–cotización de su vivienda.",
    };

    const builderQuestion: ChatMessage = {
      id: now + 1,
      role: "assistant",
      content:
        "Para iniciar, por favor seleccione la constructora de su preferencia. Si aún no tiene una definida, puede elegir la opción sin preferencia.",
    };

    const builderOptions: ChatMessage = {
      id: now + 2,
      role: "assistant",
      content: formatOptions("Opciones de constructora:", buildersForChat),
    };

    setMessages([welcome, builderQuestion, builderOptions]);
    setFlowStep("builder");
    setCurrentHouseStep(0);
    setTicketNumber(null);
    setLastDesignId(null);
    setLastEstimatedCost(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, messages.length, buildersForChat.join(",")]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleReset = () => {
    setForm({
      tipoCasa: "",
      areaVaras: "",
      habitaciones: "",
      banos: "",
      departamento: "",
      municipio: "",
      colonia: "",
      piscina: "NO",
      notasAdicionales: "",
    });
    setMessages([]);
    setInputValue("");
    setLoading(false);
    setPdfLoading(false);
    setFlowStep("builder");
    setCurrentHouseStep(0);
    setSelectedBuilder(null);
    setSelectedFerreteria(null);
    setSelectedBank(null);
    setContactPhase("email");
    setContact({
      email: "",
      phone: "",
      mode: null,
      place: "",
      virtualOption: "",
    });
    setTicketNumber(null);
    setLastDesignId(null);
    setLastEstimatedCost(null);
  };

  // AHORA async y distingue entre usuario logueado / no logueado
  const finishContact = async (nextContact: ContactInfo, now: number) => {
    setContact(nextContact);
    const ticket = generateTicketNumber();
    setTicketNumber(ticket);

    const token = localStorage.getItem("constructia_token");

    if (lastDesignId) {
      try {
        await api.post(
          "/assistant/pre-quotes",
          {
            ticket,
            estimatedCostLps: lastEstimatedCost ?? 0,
            builder: selectedBuilder,
            ferreteria: selectedFerreteria,
            bankName: selectedBank?.name,
            bankRate: selectedBank?.rate ?? null,
            contactEmail: nextContact.email,
            contactPhone: nextContact.phone,
            contactMode: nextContact.mode ?? "",
            contactPlace: nextContact.place || null,
            contactVirtualOption: nextContact.virtualOption || null,
            houseDesignId: lastDesignId,
          },
          token
            ? {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            : undefined
        );
      } catch (error) {
        console.error("[assistant] Error guardando pre–cotización:", error);
      }
    }

    const summaryParts: string[] = [];
    if (selectedBuilder) {
      summaryParts.push(`• Constructora de referencia: ${selectedBuilder}`);
    }
    if (selectedFerreteria) {
      summaryParts.push(`• Ferretería de referencia: ${selectedFerreteria}`);
    }
    if (selectedBank) {
      summaryParts.push(
        `• Banco de referencia: ${selectedBank.name}${
          selectedBank.rate > 0
            ? ` (tasa referencial ${selectedBank.rate.toFixed(2)}%)`
            : ""
        }`
      );
    }
    if (lastEstimatedCost != null) {
      summaryParts.push(
        `• Monto estimado de la pre–cotización: L. ${lastEstimatedCost.toLocaleString(
          "es-HN"
        )}`
      );
    }
    summaryParts.push(`• Correo electrónico: ${nextContact.email}`);
    summaryParts.push(`• Número de celular: ${nextContact.phone}`);
    if (nextContact.mode === "PRESENCIAL") {
      summaryParts.push(
        `• Modalidad de atención: Presencial en ${nextContact.place}`
      );
    } else if (nextContact.mode === "VIRTUAL") {
      summaryParts.push(
        `• Modalidad de atención: Virtual mediante ${
          nextContact.virtualOption || "canal por definir"
        }`
      );
    }

    const summaryMsg: ChatMessage = {
      id: now + 1,
      role: "assistant",
      content: `Hemos registrado su solicitud con el siguiente resumen:\n\n${summaryParts.join(
        "\n"
      )}`,
    };

    const ticketMsg: ChatMessage = {
      id: now + 2,
      role: "assistant",
      content: `Su número de ticket es: **${ticket}**. Podrá utilizarlo más adelante para consultar su pre–cotización en la plataforma.`,
    };

    const loginMsgText = token
      ? "Tu pre–cotización ha quedado asociada a tu cuenta de Construct-IA. Podrás verla en la sección Mis cotizaciones usando tu número de ticket."
      : "Si deseas consultar tu pre–cotización más adelante, te recomendamos registrarte o iniciar sesión desde el menú superior.";

    const loginMsg: ChatMessage = {
      id: now + 3,
      role: "assistant",
      content: loginMsgText,
    };

    const byeMsg: ChatMessage = {
      id: now + 4,
      role: "assistant",
      content:
        "Gracias por utilizar Construct-IA. Si desea iniciar una nueva pre–cotización, puede escribir la palabra 'reiniciar'.",
    };

    setMessages((prev) => [...prev, summaryMsg, ticketMsg, loginMsg, byeMsg]);
    setFlowStep("ticket");
  };

  const handleDownloadPdf = async () => {
    if (!lastDesignId) return;

    try {
      setPdfLoading(true);

      const response = await api.get(`/ai/house-design/${lastDesignId}/pdf`, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `cotizacion_${lastDesignId}.pdf`;
      link.click();

      window.URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      const now = Date.now();
      const msg: ChatMessage = {
        id: now,
        role: "assistant",
        content:
          "Hubo un inconveniente al generar el PDF de la pre–cotización. Por favor intente nuevamente.",
      };
      setMessages((prev) => [...prev, msg]);
    } finally {
      setPdfLoading(false);
    }
  };

  const processInput = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const now = Date.now();

    const userMsg: ChatMessage = {
      id: now,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);

    const lower = trimmed.toLowerCase();

    if (lower === "reiniciar" || lower === "reset") {
      const infoMsg: ChatMessage = {
        id: now + 1,
        role: "assistant",
        content:
          "De acuerdo, reiniciaremos el flujo para comenzar una nueva pre–cotización.",
      };
      setMessages((prev) => [...prev, infoMsg]);
      handleReset();
      return;
    }

    // 1) Constructora
    if (flowStep === "builder") {
      const chosen = chooseOption(trimmed, buildersForChat);
      setSelectedBuilder(chosen);

      const confirmMsg: ChatMessage = {
        id: now + 1,
        role: "assistant",
        content: `Gracias. ${
          chosen.toLowerCase().startsWith("sin preferencia")
            ? "Trabajaremos sin una constructora específica como referencia en esta etapa."
            : `Tomaremos a ${chosen} como constructora de referencia para esta pre–cotización.`
        }`,
      };

      const nextMsg: ChatMessage = {
        id: now + 2,
        role: "assistant",
        content:
          "A continuación, necesitaremos algunos datos básicos de la vivienda que desea pre–cotizar.",
      };

      const firstQuestion: ChatMessage = {
        id: now + 3,
        role: "assistant",
        content: HOUSE_STEPS[0].question,
      };

      setMessages((prev) => [...prev, confirmMsg, nextMsg, firstQuestion]);
      setFlowStep("house");
      setCurrentHouseStep(0);
      return;
    }

    // 2) Datos de la casa
    if (flowStep === "house") {
      const step = HOUSE_STEPS[currentHouseStep];
      if (!step) return;

      const newForm: HouseForm = { ...form };

      switch (step.key) {
        case "tipoCasa":
          newForm.tipoCasa = trimmed;
          break;
        case "areaVaras":
          newForm.areaVaras = trimmed;
          break;
        case "habitaciones":
          newForm.habitaciones = trimmed;
          break;
        case "banos":
          newForm.banos = trimmed;
          break;
        case "departamento":
          newForm.departamento = trimmed;
          break;
        case "municipio":
          newForm.municipio = trimmed;
          break;
        case "colonia":
          newForm.colonia = trimmed;
          break;
        case "piscina": {
          const val =
            lower.startsWith("s") || lower.includes("pisc") ? "SI" : "NO";
          newForm.piscina = val;
          break;
        }
        case "notasAdicionales":
          newForm.notasAdicionales = lower === "no" ? "" : trimmed;
          break;
      }

      setForm(newForm);

      const isLastHouseStep = currentHouseStep === HOUSE_STEPS.length - 1;

      if (!isLastHouseStep) {
        const nextIndex = currentHouseStep + 1;
        const assistantMsg: ChatMessage = {
          id: now + 1,
          role: "assistant",
          content: HOUSE_STEPS[nextIndex].question,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setCurrentHouseStep(nextIndex);
        return;
      }

      // Llamar a IA
      setLoading(true);

      const thinkingMsg: ChatMessage = {
        id: now + 1,
        role: "assistant",
        content:
          "Muchas gracias. Con la información proporcionada generaré un diseño de referencia y una pre–cotización aproximada. Por favor, espere un momento…",
      };
      setMessages((prev) => [...prev, thinkingMsg]);

      try {
        const { data } = await api.post<{
          imageUrl: string;
          designId: number;
          estimatedCostUsd: number;
        }>("/ai/house-image", newForm);

        setLastDesignId(data.designId);
        setLastEstimatedCost(data.estimatedCostUsd);

        const imgMsg: ChatMessage = {
          id: now + 2,
          role: "assistant",
          content:
            "A continuación se muestra un diseño generado por inteligencia artificial. El plano y la imagen son referenciales y se utilizan únicamente como apoyo para la pre–cotización.",
          imageUrl: data.imageUrl,
        };

        const costMsg: ChatMessage = {
          id: now + 3,
          role: "assistant",
          content: `La inversión estimada para esta vivienda es de aproximadamente L. ${data.estimatedCostUsd.toLocaleString(
            "es-HN"
          )}. Este monto es referencial y podrá ajustarse durante el análisis detallado del proyecto.`,
        };

        const builderNote: ChatMessage = {
          id: now + 4,
          role: "assistant",
          content: selectedBuilder
            ? `Esta pre–cotización se ha preparado tomando como referencia la constructora: ${selectedBuilder}.`
            : "Esta pre–cotización se ha preparado sin una constructora específica como referencia.",
        };

        const continueMsg: ChatMessage = {
          id: now + 5,
          role: "assistant",
          content:
            "¿Desea continuar para seleccionar la ferretería de referencia donde adquiriría los materiales? Responda 'sí' para continuar o 'no' si prefiere detener el proceso en este punto.",
        };

        setMessages((prev) => [
          ...prev,
          imgMsg,
          costMsg,
          builderNote,
          continueMsg,
        ]);
        setFlowStep("quoteConfirm");
      } catch (error) {
        console.error(error);
        const errorMsg: ChatMessage = {
          id: now + 2,
          role: "assistant",
          content:
            "Se ha producido un inconveniente al generar el diseño con la inteligencia artificial. Puede intentar nuevamente más tarde o ajustar algunos datos y volver a intentarlo.",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }

      return;
    }

    // 3) Confirmar si sigue
    if (flowStep === "quoteConfirm") {
      if (lower.startsWith("s")) {
        const nextMsg: ChatMessage = {
          id: now + 1,
          role: "assistant",
          content:
            "De acuerdo. Ahora, por favor seleccione la ferretería de referencia donde preferiría adquirir los materiales.",
        };
        const options: ChatMessage = {
          id: now + 2,
          role: "assistant",
          content: formatOptions(
            "Opciones de ferretería:",
            ferreteriasForChat
          ),
        };
        setMessages((prev) => [...prev, nextMsg, options]);
        setFlowStep("ferreteria");
      } else {
        const cancelMsg: ChatMessage = {
          id: now + 1,
          role: "assistant",
          content:
            "Entendido. Si en otro momento desea continuar con la selección de ferretería, puede volver a abrir el asistente o escribir 'reiniciar' para comenzar una nueva pre–cotización.",
        };
        setMessages((prev) => [...prev, cancelMsg]);
      }
      return;
    }

    // 4) Ferretería
    if (flowStep === "ferreteria") {
      const chosen = chooseOption(trimmed, ferreteriasForChat);
      setSelectedFerreteria(chosen);

      const confirmMsg: ChatMessage = {
        id: now + 1,
        role: "assistant",
        content: `Gracias. ${
          chosen.toLowerCase().startsWith("sin preferencia")
            ? "Tomaremos en cuenta que, por el momento, no cuenta con una ferretería específica."
            : `Tomaremos la ferretería ${chosen} como punto de referencia para la cotización de materiales.`
        }`,
      };

      const nextMsg: ChatMessage = {
        id: now + 2,
        role: "assistant",
        content:
          "Ahora, por favor seleccione el banco de referencia para la simulación del financiamiento. Le mostraremos algunas tasas referenciales:",
      };

      const bankLines = banksForChat.map(
        (b, idx) =>
          `${idx + 1}. ${b.name}${
            b.rate > 0 ? ` – tasa de interés ${b.rate.toFixed(2)}%` : ""
          }`
      );
      const bankMsg: ChatMessage = {
        id: now + 3,
        role: "assistant",
        content: `Opciones de banco:\n${bankLines.join("\n")}`,
      };

      setMessages((prev) => [...prev, confirmMsg, nextMsg, bankMsg]);
      setFlowStep("bank");
      return;
    }

    // 5) Banco
    if (flowStep === "bank") {
      const bankNames = banksForChat.map((b) => b.name);
      const chosenName = chooseOption(trimmed, bankNames);
      const bankObj =
        banksForChat.find((b) => b.name === chosenName) ??
        banksForChat[banksForChat.length - 1];
      setSelectedBank(bankObj);

      const confirmMsg: ChatMessage = {
        id: now + 1,
        role: "assistant",
        content:
          bankObj.rate > 0
            ? `Perfecto. Utilizaremos ${bankObj.name} con una tasa referencial de ${bankObj.rate.toFixed(
                2
              )}% para la simulación del financiamiento.`
            : "Perfecto. Dejaremos el financiamiento abierto, sin asociarlo a un banco específico por el momento.",
      };

      const nextMsg: ChatMessage = {
        id: now + 2,
        role: "assistant",
        content:
          "Para registrar su solicitud y poder darle seguimiento, necesitaremos algunos datos de contacto.",
      };

      const askEmail: ChatMessage = {
        id: now + 3,
        role: "assistant",
        content: "Por favor, indíquenos su correo electrónico.",
      };

      setMessages((prev) => [...prev, confirmMsg, nextMsg, askEmail]);
      setFlowStep("contact");
      setContactPhase("email");
      return;
    }

    // 6) Datos de contacto
    if (flowStep === "contact") {
      if (contactPhase === "email") {
        setContact((prev) => ({ ...prev, email: trimmed }));
        const askPhone: ChatMessage = {
          id: now + 1,
          role: "assistant",
          content:
            "Gracias. Ahora, por favor indíquenos su número de celular (incluya el código de país si aplica).",
        };
        setMessages((prev) => [...prev, askPhone]);
        setContactPhase("phone");
        return;
      }

      if (contactPhase === "phone") {
        setContact((prev) => ({ ...prev, phone: trimmed }));
        const askMode: ChatMessage = {
          id: now + 1,
          role: "assistant",
          content:
            "¿Cómo prefiere formalizar la propuesta? Escriba 'presencial' o 'virtual'.",
        };
        setMessages((prev) => [...prev, askMode]);
        setContactPhase("mode");
        return;
      }

      if (contactPhase === "mode") {
        const isPresencial = lower.startsWith("p");
        const mode: ContactMode = isPresencial ? "PRESENCIAL" : "VIRTUAL";
        const nextContact: ContactInfo = { ...contact, mode };
        setContact(nextContact);

        if (mode === "PRESENCIAL") {
          const askPlace: ChatMessage = {
            id: now + 1,
            role: "assistant",
            content:
              "Perfecto. ¿En qué lugar prefiere que le atienda nuestro equipo? (por ejemplo: oficinas de la constructora, su domicilio, una cafetería, etc.).",
          };
          setMessages((prev) => [...prev, askPlace]);
          setContactPhase("place");
        } else {
          const askVirtual: ChatMessage = {
            id: now + 1,
            role: "assistant",
            content:
              "De acuerdo. ¿Por cuál canal virtual prefiere que nos comuniquemos? Elija una opción:\n1. WhatsApp\n2. Zoom\n3. Google Meet",
          };
          setMessages((prev) => [...prev, askVirtual]);
          setContactPhase("virtualOption");
        }
        return;
      }

      if (contactPhase === "place") {
        const nextContact: ContactInfo = { ...contact, place: trimmed };
        await finishContact(nextContact, now);
        return;
      }

      if (contactPhase === "virtualOption") {
        let option: ContactInfo["virtualOption"] = "WhatsApp";
        if (lower.startsWith("2") || lower.includes("zoom")) {
          option = "Zoom";
        } else if (lower.startsWith("3") || lower.includes("meet")) {
          option = "Google Meet";
        }
        const nextContact: ContactInfo = { ...contact, virtualOption: option };
        await finishContact(nextContact, now);
        return;
      }
    }

    // 7) Ticket ya generado
    if (flowStep === "ticket") {
      const msg: ChatMessage = {
        id: now + 1,
        role: "assistant",
        content:
          "Su ticket ya ha sido generado. Si desea iniciar una nueva pre–cotización, puede escribir la palabra 'reiniciar'.",
      };
      setMessages((prev) => [...prev, msg]);
      return;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || !isOpen) return;
    const current = inputValue;
    setInputValue("");
    await processInput(current);
  };

  const quickReplies = (() => {
    if (!isOpen || loading) return [] as { label: string; value: string }[];

    if (flowStep === "builder") {
      return buildersForChat.map((b) => ({ label: b, value: b }));
    }
    if (flowStep === "quoteConfirm") {
      return [
        { label: "Sí, continuar", value: "sí" },
        { label: "No, detener el proceso", value: "no" },
      ];
    }
    if (flowStep === "ferreteria") {
      return ferreteriasForChat.map((f) => ({ label: f, value: f }));
    }
    if (flowStep === "bank") {
      return banksForChat.map((b) => ({
        label: b.rate > 0 ? `${b.name} – ${b.rate.toFixed(2)}%` : b.name,
        value: b.name,
      }));
    }
    if (flowStep === "contact" && contactPhase === "mode") {
      return [
        { label: "Presencial", value: "presencial" },
        { label: "Virtual", value: "virtual" },
      ];
    }
    if (flowStep === "contact" && contactPhase === "virtualOption") {
      return [
        { label: "WhatsApp", value: "WhatsApp" },
        { label: "Zoom", value: "Zoom" },
        { label: "Google Meet", value: "Google Meet" },
      ];
    }

    return [] as { label: string; value: string }[];
  })();

  const showPdfButton =
    !!lastDesignId &&
    (flowStep === "quoteConfirm" ||
      flowStep === "ferreteria" ||
      flowStep === "bank" ||
      flowStep === "contact" ||
      flowStep === "ticket");

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-white px-3 py-3 flex items-center gap-2 hover:shadow-2xl transition-shadow"
      >
        <div className="h-9 w-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-semibold text-sm">
          IA
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-semibold text-slate-900">
            Asistente de cotización
          </span>
          <span className="text-[11px] text-slate-500">
            Le guiamos en su pre–cotización
          </span>
        </div>
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[95%] max-w-md">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[500px]">
            {/* Cabecera */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  IA
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase">
                    Construct-IA
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Asistente virtual de pre–cotización
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-slate-300 hover:text-white"
                >
                  Reiniciar
                </button>
                <button
                  type="button"
                  onClick={handleToggle}
                  className="text-lg leading-none text-slate-200 hover:text-white"
                  aria-label="Cerrar chat"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-slate-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-line ${
                      m.role === "assistant"
                        ? "bg-white text-slate-900 border border-slate-200"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {m.content}
                    {m.imageUrl && (
                      <img
                        src={m.imageUrl}
                        alt="Diseño generado por IA"
                        className="mt-2 rounded-xl border border-slate-200"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input + acciones */}
            <form
              onSubmit={handleSend}
              className="border-t border-slate-200 px-3 py-2 bg-white"
            >
              {showPdfButton && (
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading || !lastDesignId}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-slate-300 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {pdfLoading
                      ? "Generando PDF…"
                      : "Descargar PDF de la pre–cotización"}
                  </button>
                </div>
              )}

              {quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {quickReplies.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      className="text-[11px] px-2 py-1 rounded-full border border-slate-300 hover:bg-slate-100"
                      onClick={() => processInput(q.value)}
                      disabled={loading}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 border border-slate-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    loading
                      ? "Procesando información…"
                      : "Escriba su respuesta aquí…"
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !isOpen}
                  className="px-3 py-2 text-sm font-semibold rounded-full bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  ➤
                </button>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Puede escribir &quot;reiniciar&quot; en cualquier momento para
                comenzar una nueva pre–cotización.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


