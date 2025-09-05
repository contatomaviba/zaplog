export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "password"
  | "phone"
  | "select"
  | "percent"
  | "action";

export interface ValidationRule {
  kind: "min" | "max" | "pattern" | "requires";
  value: number | string;
  message?: string;
}

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  mask?: string;
  validations?: ValidationRule[];
  help?: string;
}

export interface PageSchema {
  fields: Record<string, FieldSpec>;
  actions?: Record<string, FieldSpec>; // type: "action"
}

export interface UISchema {
  trips: PageSchema;
  drivers: PageSchema;
  auth: PageSchema;
}

export const uiSchema: UISchema = {
  trips: {
    fields: {
      driverName: {
        key: "driverName",
        label: "Motorista",
        type: "text",
        required: true,
        validations: [
          { kind: "min", value: 2 },
          { kind: "max", value: 80 },
        ],
      },
      phone: {
        key: "phone",
        label: "Telefone",
        type: "phone",
        required: true,
        validations: [{ kind: "pattern", value: "^\\d{10,11}$", message: "Use somente números com DDD" }],
      },
      plate: {
        key: "plate",
        label: "Placa",
        type: "text",
        required: true,
        validations: [{ kind: "pattern", value: "^[A-Z]{3}-?\\d{4}$", message: "Formato ABC-1234" }],
      },
      origin: { key: "origin", label: "Origem", type: "text", required: true },
      destination: { key: "destination", label: "Destino", type: "text", required: true },
      status: {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["active", "pending", "completed", "cancelled"],
      },
      observations: { key: "observations", label: "Observação", type: "textarea" },
      progress: { key: "progress", label: "Progresso", type: "percent" },
    },
    actions: {
      complete: {
        key: "complete",
        label: "Finalizar",
        type: "action",
        validations: [{ kind: "requires", value: "status!=completed" }],
        help: "Disponível apenas na página Viagens",
      },
      cancel: {
        key: "cancel",
        label: "Cancelar",
        type: "action",
        validations: [{ kind: "requires", value: "status!=cancelled" }],
        help: "Disponível apenas na página Viagens",
      },
    },
  },
  drivers: {
    fields: {
      name: {
        key: "name",
        label: "Nome",
        type: "text",
        required: true,
        validations: [
          { kind: "min", value: 2 },
          { kind: "max", value: 80 },
        ],
      },
    },
  },
  auth: {
    fields: {
      email: { key: "email", label: "E-mail", type: "email", required: true },
      password: { key: "password", label: "Senha", type: "password", required: true, validations: [{ kind: "min", value: 6 }] },
    },
  },
};

export default uiSchema;

