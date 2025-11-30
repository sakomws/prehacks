"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  introduction: string;
  mission: string;
}

interface ClassItem {
  id: number;
  name: string;
  icon: string;
  description: string;
  price: string;
  duration: string;
  color: string;
  featured?: boolean;
}

interface PackageItem {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  price: string;
  description: string;
  features: string[];
  experience: string;
  color: string;
  featured?: boolean;
}

interface ContentContextType {
  aboutContent: AboutContent;
  classes: ClassItem[];
  packages: PackageItem[];
  updateAboutContent: (content: AboutContent) => void;
  updateClass: (classItem: ClassItem) => void;
  updatePackage: (packageItem: PackageItem) => void;
  addClass: (classItem: ClassItem) => void;
  addPackage: (packageItem: PackageItem) => void;
  deleteClass: (id: number) => void;
  deletePackage: (id: number) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Default content
const DEFAULT_ABOUT: AboutContent = {
  heroTitle: "🌴🐾 Who We Are",
  heroSubtitle: "The Dogangelenos Standard",
  introduction: "Welcome to Dogangelenos, where elevated living meets exceptional dog training. In a city known for its lifestyle, culture, and high standards, we believe your dog's training should reflect the same level of intention and quality.",
  mission: "Your dog deserves a calm, confident, and joyful life— and you deserve a training experience that feels effortless, personalized, and luxe.",
};

const DEFAULT_CLASSES: ClassItem[] = [
  {
    id: 1,
    name: "Puppy Training",
    icon: "🐶",
    description: "Ages 8 weeks - 6 months. Foundation skills, socialization, and potty training.",
    price: "$199",
    duration: "6 weeks",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    name: "Basic Obedience",
    icon: "🦮",
    description: "Sit, stay, come, heel, and leash manners. Perfect for all ages.",
    price: "$249",
    duration: "6 weeks",
    color: "from-pink-400 to-pink-600",
    featured: true,
  },
  {
    id: 3,
    name: "Advanced Training",
    icon: "🏆",
    description: "Off-leash control, complex commands, and behavioral refinement.",
    price: "$349",
    duration: "8 weeks",
    color: "from-purple-400 to-purple-600",
  },
];

const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: 1,
    icon: "🐾",
    title: "Puppy Training Package",
    subtitle: "6 Sessions — First Session Complimentary",
    price: "$1,199",
    description: "A curated, foundational program designed to give your puppy the strongest start in life. Perfect for Los Angeles families who want confidence, structure, and early socialization in a calm, luxury-level experience.",
    features: [
      "Foundational Obedience - Sit, stay, come, down",
      "Premium Socialization Experiences",
      "Potty Training Mastery",
      "Early Leash Manners",
      "Puppy Behavior Solutions",
      "Owner Coaching & Lifestyle Alignment",
    ],
    experience: "A luxury onboarding into dog parenthood — building the foundation for a well-balanced, well-mannered future adult dog.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    icon: "🐶",
    title: "Basic Obedience Training",
    subtitle: "8 Sessions — First Session Complimentary",
    price: "$1,599",
    description: "Our signature obedience program for dogs ready to elevate their manners and master the fundamentals. Ideal for busy Los Angeles households seeking clarity, structure, and predictable behavior.",
    features: [
      "Core Obedience Commands",
      "Refined Leash Walking",
      "Focus & Engagement Training",
      "Behavioral Corrections",
      "Stay, Wait & Patience Work",
      "Reliable Recall",
      "Owner Training & Reinforcement Systems",
    ],
    experience: "A polished obedience foundation — perfect for dogs aspiring toward advanced work or simply better everyday manners.",
    color: "from-pink-500 to-purple-500",
    featured: true,
  },
  {
    id: 3,
    icon: "🔧",
    title: "Behavior Modification Program",
    subtitle: "Fully Customized • Duration Varies by Complexity",
    price: "Starting at $2,499",
    description: "A high-touch, expert-led program designed for dogs experiencing anxiety, reactivity, fear, or more complex behavioral challenges. Ideal for owners seeking deep transformation guided by our elite behavior specialists.",
    features: [
      "Comprehensive Behavioral Assessment",
      "Personalized Behavior Plan",
      "Desensitization & Counterconditioning",
      "Positive Reinforcement Strategies",
      "Targeted Behavioral Exercises",
      "Owner Coaching & Home Protocols",
      "Ongoing Adjustments & Follow-Up",
    ],
    experience: "A premium, concierge-level transformation program rooted in behavioral science and delivered with exceptional care.",
    color: "from-purple-500 to-indigo-500",
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ContentProvider({ children }: { children: ReactNode }) {
  const [aboutContent, setAboutContent] = useState<AboutContent>(DEFAULT_ABOUT);
  const [classes, setClasses] = useState<ClassItem[]>(DEFAULT_CLASSES);
  const [packages, setPackages] = useState<PackageItem[]>(DEFAULT_PACKAGES);
  const [loading, setLoading] = useState(true);

  // Load from API on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch about content
        const aboutRes = await fetch(`${API_URL}/api/content/about`);
        if (aboutRes.ok) {
          const aboutData = await aboutRes.json();
          setAboutContent(aboutData);
        }

        // Fetch classes
        const classesRes = await fetch(`${API_URL}/api/content/classes`);
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData);
        }

        // Fetch packages
        const packagesRes = await fetch(`${API_URL}/api/content/packages`);
        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          setPackages(packagesData);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const updateAboutContent = async (content: AboutContent) => {
    try {
      const response = await fetch(`${API_URL}/api/content/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        const updated = await response.json();
        setAboutContent(updated);
      } else {
        throw new Error("Failed to update about content");
      }
    } catch (error) {
      console.error("Error updating about content:", error);
      throw error;
    }
  };

  const updateClass = async (classItem: ClassItem) => {
    try {
      const response = await fetch(`${API_URL}/api/content/classes/${classItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classItem),
      });

      if (response.ok) {
        const updated = await response.json();
        setClasses(classes.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        throw new Error("Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      throw error;
    }
  };

  const updatePackage = async (packageItem: PackageItem) => {
    try {
      const response = await fetch(`${API_URL}/api/content/packages/${packageItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageItem),
      });

      if (response.ok) {
        const updated = await response.json();
        setPackages(packages.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        throw new Error("Failed to update package");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      throw error;
    }
  };

  const addClass = async (classItem: ClassItem) => {
    try {
      const response = await fetch(`${API_URL}/api/content/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classItem),
      });

      if (response.ok) {
        const newClass = await response.json();
        setClasses([...classes, newClass]);
      } else {
        throw new Error("Failed to add class");
      }
    } catch (error) {
      console.error("Error adding class:", error);
      throw error;
    }
  };

  const addPackage = async (packageItem: PackageItem) => {
    try {
      const response = await fetch(`${API_URL}/api/content/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageItem),
      });

      if (response.ok) {
        const newPackage = await response.json();
        setPackages([...packages, newPackage]);
      } else {
        throw new Error("Failed to add package");
      }
    } catch (error) {
      console.error("Error adding package:", error);
      throw error;
    }
  };

  const deleteClass = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/content/classes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setClasses(classes.filter((c) => c.id !== id));
      } else {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  };

  const deletePackage = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/content/packages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPackages(packages.filter((p) => p.id !== id));
      } else {
        throw new Error("Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  };

  return (
    <ContentContext.Provider
      value={{
        aboutContent,
        classes,
        packages,
        updateAboutContent,
        updateClass,
        updatePackage,
        addClass,
        addPackage,
        deleteClass,
        deletePackage,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
