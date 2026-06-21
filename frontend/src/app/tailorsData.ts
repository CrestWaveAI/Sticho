export interface Tailor {
  id: string;
  name: string;
  city: string;
  locality: string;
  pinCode: string;
  rating: number;
  reviews: number;
  categories: ("Men's" | "Women's" | "Boutique" | "Alterations" | "Uniforms")[];
  address: string;
  description: string;
  phone: string;
  gradient: string;
}

export const tailors: Tailor[] = [
  {
    id: "1",
    name: "Signature Threads",
    city: "Bangalore",
    locality: "Indiranagar",
    pinCode: "560038",
    rating: 4.8,
    reviews: 120,
    categories: ["Women's", "Boutique", "Alterations"],
    address: "12th Main Road, Indiranagar, Bangalore - 560038",
    description: "Specializing in custom bridal wear, designer blouses, and precision alterations with a modern, elegant touch.",
    phone: "+91 98765 43210",
    gradient: "linear-gradient(135deg, #bf91ac 0%, #7d4d68 100%)",
  },
  {
    id: "2",
    name: "The Gentleman's Cut",
    city: "Bangalore",
    locality: "Koramangala",
    pinCode: "560034",
    rating: 4.9,
    reviews: 95,
    categories: ["Men's", "Alterations"],
    address: "80 Feet Road, Koramangala 4th Block, Bangalore - 560034",
    description: "Bespoke men's suits, blazers, formal shirts, and trousers crafted from premium Italian fabrics.",
    phone: "+91 98765 43211",
    gradient: "linear-gradient(135deg, #2b2b2b 0%, #bf91ac 100%)",
  },
  {
    id: "3",
    name: "Elite Uniforms & Apparel",
    city: "Mumbai",
    locality: "Bandra West",
    pinCode: "400050",
    rating: 4.6,
    reviews: 150,
    categories: ["Uniforms", "Alterations"],
    address: "Linking Road, Opp. National College, Bandra West, Mumbai - 400050",
    description: "High-quality custom uniforms for schools, medical clinics, and corporate offices. Quick turnaround times.",
    phone: "+91 98765 43212",
    gradient: "linear-gradient(135deg, #424e5a 0%, #bf91ac 100%)",
  },
  {
    id: "4",
    name: "Vogue Boutique",
    city: "Mumbai",
    locality: "Colaba",
    pinCode: "400001",
    rating: 4.7,
    reviews: 82,
    categories: ["Women's", "Boutique"],
    address: "Colaba Causeway, Near Regal Cinema, Colaba, Mumbai - 400001",
    description: "Exquisite designer ethnic wear, lehengas, and evening gowns curated for celebrations.",
    phone: "+91 98765 43213",
    gradient: "linear-gradient(135deg, #7c4c68 0%, #c499b2 100%)",
  },
  {
    id: "5",
    name: "Quick Stitch Alterations",
    city: "Delhi",
    locality: "Connaught Place",
    pinCode: "110001",
    rating: 4.5,
    reviews: 210,
    categories: ["Alterations"],
    address: "Inner Circle, Block F, Connaught Place, New Delhi - 110001",
    description: "Fast, reliable clothing adjustments and repair services. Same-day service available for urgent needs.",
    phone: "+91 98765 43214",
    gradient: "linear-gradient(135deg, #333333 0%, #555555 100%)",
  },
  {
    id: "6",
    name: "Classic Tailoring House",
    city: "Delhi",
    locality: "Karol Bagh",
    pinCode: "110005",
    rating: 4.4,
    reviews: 180,
    categories: ["Men's", "Women's", "Uniforms"],
    address: "Ajmal Khan Road, Karol Bagh, New Delhi - 110005",
    description: "Decades of experience in traditional ethnic wear, school uniforms, and custom tailoring for the entire family.",
    phone: "+91 98765 43215",
    gradient: "linear-gradient(135deg, #bf91ac 0%, #2b2b2b 100%)",
  },
  {
    id: "7",
    name: "Bespoke By Design",
    city: "Bangalore",
    locality: "Whitefield",
    pinCode: "560066",
    rating: 4.9,
    reviews: 64,
    categories: ["Men's", "Women's", "Boutique"],
    address: "ITPL Main Road, Near Hope Farm, Whitefield, Bangalore - 560066",
    description: "Luxury tailoring offering bespoke suits, designer ethnic wear, and personalized styling consultations.",
    phone: "+91 98765 43216",
    gradient: "linear-gradient(135deg, #9b6c86 0%, #bf91ac 100%)",
  },
];
