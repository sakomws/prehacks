"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DRDocument, Contact, Procedure, CriticalityLevel } from "@/types/document";
import { useToast } from "@/components/ToastProvider";
import { InlineValidation } from "@/components/InlineValidation";
import { ValidationFeedback, ValidationRules } from "@/components/ValidationFeedback";
import { FormField } from "@/components/FormField";

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const { showToast, showValidationToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [scenario, setScenario] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [criticality, setCriticality] = useState<CriticalityLevel>("medium");
  const [rto, setRto] = useState(0);
  const [rpo, setRpo] = useState(0);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  async function loadDocument() {
    try {
      setLoading(true);
      const doc = await apiClient.getDocument(documentId);
      setTitle(doc.title);
      setScenario(doc.scenario);
      setCategories(doc.categories);
      setCriticality(doc.criticality);
      setRto(doc.rto);
      setRpo(doc.rpo);
      setProcedures(doc.procedures);
      setContacts(doc.contacts);
    } catch (err: any) {
      setError(err.message || "Failed to load document");
      showToast(err.message || "Failed to load document", "error");
    } finally {
      setLoading(false);
    }
  }

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
      await apiClient.updateDocument(documentId, {
        title,
        scenario,
        categories,
        criticality,
        rto,
        rpo,
        procedures,
        contacts,
      });
      showToast("Document updated successfully", "success");
      router.push(`/documents/${documentId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update document");
      showToast(err.message || "Failed to update document", "error");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/documents/${documentId}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Document
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Document</h1>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
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
                />
                <InlineValidation 
                  error={fieldErrors.title}
                  success={title.trim() && !fieldErrors.title ? "Title looks good" : undefined}
                />
              </div>

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
                        placeholder="Category name"
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                  {fieldErrors.rto && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.rto}</p>
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
                  {fieldErrors.rpo && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.rpo}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Disaster Scenario */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Disaster Scenario *</h2>
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
              placeholder="Describe the disaster scenario..."
            />
            <InlineValidation 
              error={fieldErrors.scenario}
              success={scenario.trim() && scenario.length > 50 && !fieldErrors.scenario ? "Scenario description looks comprehensive" : undefined}
              warning={scenario.trim() && scenario.length < 50 && scenario.length > 0 ? "Consider adding more detail to the scenario description" : undefined}
            />
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
                    <button
                      type="button"
                      onClick={() => removeProcedure(procIdx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={proc.name}
                      onChange={(e) => updateProcedure(procIdx, "name", e.target.value)}
                      placeholder="Procedure name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="number"
                      value={proc.estimatedDuration}
                      onChange={(e) =>
                        updateProcedure(procIdx, "estimatedDuration", parseInt(e.target.value))
                      }
                      placeholder="Estimated duration (minutes)"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />

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
                          <button
                            type="button"
                            onClick={() => removeStep(procIdx, stepIdx)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            ✕
                          </button>
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
                    <button
                      type="button"
                      onClick={() => removeContact(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(idx, "name", e.target.value)}
                      placeholder="Name"
                      required
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={contact.role}
                      onChange={(e) => updateContact(idx, "role", e.target.value)}
                      placeholder="Role"
                      required
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(idx, "phone", e.target.value)}
                      placeholder="Phone"
                      required
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(idx, "email", e.target.value)}
                      placeholder="Email"
                      required
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/documents/${documentId}`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
