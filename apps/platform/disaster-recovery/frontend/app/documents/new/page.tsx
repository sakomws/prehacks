"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Contact, Procedure, CriticalityLevel } from "@/types/document";
import { useToast } from "@/components/ToastProvider";
import { FormField } from "@/components/FormField";
import { InlineValidation } from "@/components/InlineValidation";
import { ValidationFeedback, ValidationRules } from "@/components/ValidationFeedback";

export default function NewDocumentPage() {
  const router = useRouter();
  const { showToast, showValidationToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [scenario, setScenario] = useState("");
  const [categories, setCategories] = useState<string[]>([""]);
  const [criticality, setCriticality] = useState<CriticalityLevel>("medium");
  const [rto, setRto] = useState(60);
  const [rpo, setRpo] = useState(60);
  const [procedures, setProcedures] = useState<Procedure[]>([
    { name: "", steps: [""], estimatedDuration: 0 },
  ]);
  const [contacts, setContacts] = useState<Contact[]>([
    { name: "", role: "", phone: "", email: "" },
  ]);

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }
    if (!scenario.trim()) {
      errors.scenario = "Disaster scenario is required";
    }
    if (categories.length === 0 || !categories.some(cat => cat.trim())) {
      errors.categories = "At least one category is required";
    }
    if (rto <= 0) {
      errors.rto = "RTO must be a positive number";
    }
    if (rpo <= 0) {
      errors.rpo = "RPO must be a positive number";
    }

    // Validate procedures
    procedures.forEach((proc, idx) => {
      if (!proc.name.trim()) {
        errors[`procedure_${idx}_name`] = "Procedure name is required";
      }
      if (proc.estimatedDuration <= 0) {
        errors[`procedure_${idx}_duration`] = "Duration must be positive";
      }
      proc.steps.forEach((step, stepIdx) => {
        if (!step.trim()) {
          errors[`procedure_${idx}_step_${stepIdx}`] = "Step cannot be empty";
        }
      });
    });

    // Validate contacts
    contacts.forEach((contact, idx) => {
      if (!contact.name.trim()) {
        errors[`contact_${idx}_name`] = "Contact name is required";
      }
      if (!contact.role.trim()) {
        errors[`contact_${idx}_role`] = "Contact role is required";
      }
      if (!contact.phone.trim()) {
        errors[`contact_${idx}_phone`] = "Phone number is required";
      }
      if (!contact.email.trim()) {
        errors[`contact_${idx}_email`] = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        errors[`contact_${idx}_email`] = "Invalid email format";
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      const validationErrors = Object.entries(fieldErrors).map(([field, message]) => ({
        field: field.replace(/_/g, ' '),
        message
      }));
      showValidationToast(validationErrors);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const doc = await apiClient.createDocument({
        title,
        scenario,
        categories: categories.filter(cat => cat.trim()),
        criticality,
        rto,
        rpo,
        procedures,
        contacts,
      });
      showToast("Document created successfully", "success");
      router.push(`/documents/${doc.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create document");
      showToast(err.message || "Failed to create document", "error");
      setSaving(false);
    }
  }

  function addProcedure() {
    setProcedures([...procedures, { name: "", steps: [""], estimatedDuration: 0 }]);
  }

  function updateProcedure(index: number, field: keyof Procedure, value: any) {
    const updated = [...procedures];
    updated[index] = { ...updated[index], [field]: value };
    setProcedures(updated);
  }

  function addStep(procIndex: number) {
    const updated = [...procedures];
    updated[procIndex].steps.push("");
    setProcedures(updated);
  }

  function updateStep(procIndex: number, stepIndex: number, value: string) {
    const updated = [...procedures];
    updated[procIndex].steps[stepIndex] = value;
    setProcedures(updated);
  }

  function removeStep(procIndex: number, stepIndex: number) {
    const updated = [...procedures];
    updated[procIndex].steps.splice(stepIndex, 1);
    setProcedures(updated);
  }

  function removeProcedure(index: number) {
    setProcedures(procedures.filter((_, i) => i !== index));
  }

  function addContact() {
    setContacts([...contacts, { name: "", role: "", phone: "", email: "" }]);
  }

  function updateContact(index: number, field: keyof Contact, value: string) {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  }

  function removeContact(index: number) {
    setContacts(contacts.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/documents" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Documents
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Document</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <FormField
                label="Title"
                required
                error={fieldErrors.title}
                helpText="A clear, descriptive title for the disaster recovery scenario"
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) {
                      setFieldErrors({ ...fieldErrors, title: "" });
                    }
                  }}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Database Server Failure Recovery"
                />
                <ValidationFeedback
                  value={title}
                  rules={[
                    ValidationRules.required("Title is required"),
                    ValidationRules.minLength(5, "Title should be at least 5 characters"),
                    ValidationRules.recommendedMinLength(15, "Consider a more descriptive title")
                  ]}
                  successMessage="Title looks good!"
                />
              </FormField>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories *</label>
                <div className="space-y-2">
                  {categories.map((category, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[idx] = e.target.value;
                          setCategories(updated);
                          if (fieldErrors.categories) {
                            setFieldErrors({ ...fieldErrors, categories: "" });
                          }
                        }}
                        placeholder="e.g., Infrastructure, Application, Security"
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = categories.filter((_, i) => i !== idx);
                            setCategories(updated);
                          }}
                          className="text-red-600 hover:text-red-700 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCategories([...categories, ""])}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    + Add Category
                  </button>
                </div>
                {fieldErrors.categories && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.categories}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criticality *</label>
                <select
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value as CriticalityLevel)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RTO (minutes) *
                  </label>
                  <input
                    type="number"
                    value={rto}
                    onChange={(e) => {
                      setRto(parseInt(e.target.value) || 0);
                      if (fieldErrors.rto) {
                        setFieldErrors({ ...fieldErrors, rto: "" });
                      }
                    }}
                    required
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.rto ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.rto ? (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.rto}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Recovery Time Objective</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RPO (minutes) *
                  </label>
                  <input
                    type="number"
                    value={rpo}
                    onChange={(e) => {
                      setRpo(parseInt(e.target.value) || 0);
                      if (fieldErrors.rpo) {
                        setFieldErrors({ ...fieldErrors, rpo: "" });
                      }
                    }}
                    required
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.rpo ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.rpo ? (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.rpo}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Recovery Point Objective</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Disaster Scenario */}
          <div className="bg-white p-6 rounded-lg shadow">
            <FormField
              label="Disaster Scenario"
              required
              error={fieldErrors.scenario}
              helpText="Provide a detailed description of the disaster scenario, including what could go wrong and the potential impact"
            >
              <textarea
                value={scenario}
                onChange={(e) => {
                  setScenario(e.target.value);
                  if (fieldErrors.scenario) {
                    setFieldErrors({ ...fieldErrors, scenario: "" });
                  }
                }}
                required
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.scenario ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe the disaster scenario in detail..."
              />
              <ValidationFeedback
                value={scenario}
                rules={[
                  ValidationRules.required("Scenario description is required"),
                  ValidationRules.minLength(20, "Scenario should be at least 20 characters"),
                  ValidationRules.recommendedMinLength(100, "Consider adding more detail for a comprehensive scenario description")
                ]}
                successMessage="Scenario description looks comprehensive!"
              />
            </FormField>
          </div>

          {/* Procedures */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recovery Procedures</h2>
              <button
                type="button"
                onClick={addProcedure}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Add Procedure
              </button>
            </div>

            <div className="space-y-4">
              {procedures.map((proc, procIdx) => (
                <div key={procIdx} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">Procedure {procIdx + 1}</h3>
                    {procedures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProcedure(procIdx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={proc.name}
                        onChange={(e) => {
                          updateProcedure(procIdx, "name", e.target.value);
                          const errorKey = `procedure_${procIdx}_name`;
                          if (fieldErrors[errorKey]) {
                            setFieldErrors({ ...fieldErrors, [errorKey]: "" });
                          }
                        }}
                        placeholder="Procedure name"
                        required
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                          fieldErrors[`procedure_${procIdx}_name`] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors[`procedure_${procIdx}_name`] && (
                        <p className="text-red-600 text-sm mt-1">{fieldErrors[`procedure_${procIdx}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="number"
                        value={proc.estimatedDuration}
                        onChange={(e) => {
                          updateProcedure(procIdx, "estimatedDuration", parseInt(e.target.value) || 0);
                          const errorKey = `procedure_${procIdx}_duration`;
                          if (fieldErrors[errorKey]) {
                            setFieldErrors({ ...fieldErrors, [errorKey]: "" });
                          }
                        }}
                        placeholder="Estimated duration (minutes)"
                        required
                        min="1"
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                          fieldErrors[`procedure_${procIdx}_duration`] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors[`procedure_${procIdx}_duration`] && (
                        <p className="text-red-600 text-sm mt-1">{fieldErrors[`procedure_${procIdx}_duration`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Steps:</label>
                      {proc.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => updateStep(procIdx, stepIdx, e.target.value)}
                            placeholder={`Step ${stepIdx + 1}`}
                            required
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          {proc.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStep(procIdx, stepIdx)}
                              className="text-red-600 hover:text-red-700 px-2"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addStep(procIdx)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        + Add Step
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Emergency Contacts</h2>
              <button
                type="button"
                onClick={addContact}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Add Contact
              </button>
            </div>

            <div className="space-y-4">
              {contacts.map((contact, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">Contact {idx + 1}</h3>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => {
                          updateContact(idx, "name", e.target.value);
                          const errorKey = `contact_${idx}_name`;
                          if (fieldErrors[errorKey]) {
                            setFieldErrors({ ...fieldErrors, [errorKey]: "" });
                          }
                        }}
                        placeholder="Name"
                        required
                        className={`px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 w-full ${
                          fieldErrors[`contact_${idx}_name`] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors[`contact_${idx}_name`] && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors[`contact_${idx}_name`]}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => {
                          updateContact(idx, "role", e.target.value);
                          const errorKey = `contact_${idx}_role`;
                          if (fieldErrors[errorKey]) {
                            setFieldErrors({ ...fieldErrors, [errorKey]: "" });
                          }
                        }}
                        placeholder="Role"
                        required
                        className={`px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 w-full ${
                          fieldErrors[`contact_${idx}_role`] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors[`contact_${idx}_role`] && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors[`contact_${idx}_role`]}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => {
                          updateContact(idx, "phone", e.target.value);
                          const errorKey = `contact_${idx}_phone`;
                          if (fieldErrors[errorKey]) {
                            setFieldErrors({ ...fieldErrors, [errorKey]: "" });
                          }
                        }}
                        placeholder="Phone"
                        required
                        className={`px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 w-full ${
                          fieldErrors[`contact_${idx}_phone`] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <ValidationFeedback
                        value={contact.phone}
                        rules={[
                          ValidationRules.required("Phone number is required"),
                          ValidationRules.phone("Please enter a valid phone number")
                        ]}
                        successMessage="Valid phone number"
                        showSuccess={false}
                      />
                      {fieldErrors[`contact_${idx}_phone`] && (
                        <InlineValidation error={fieldErrors[`contact_${idx}_phone`]} />
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => {
                          updateContact(idx, "email", e.target.value);
                          const errorKey = `contact_${idx}_email`;
                          if (fieldErrors[errorKey]) {
                            setFieldErrors({ ...fieldErrors, [errorKey]: "" });
                          }
                        }}
                        placeholder="Email"
                        required
                        className={`px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 w-full ${
                          fieldErrors[`contact_${idx}_email`] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <ValidationFeedback
                        value={contact.email}
                        rules={[
                          ValidationRules.required("Email is required"),
                          ValidationRules.email("Please enter a valid email address")
                        ]}
                        successMessage="Valid email"
                        showSuccess={false}
                      />
                      {fieldErrors[`contact_${idx}_email`] && (
                        <InlineValidation error={fieldErrors[`contact_${idx}_email`]} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href="/documents"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
