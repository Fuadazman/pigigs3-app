```javascript
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import AddServiceForm from "@/components/AddServiceForm";

export default function Home() {
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [lang, setLang] = useState("ar");
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [piAvailable, setPiAvailable] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setServices(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const initPi = () => {
      if (!window.Pi) {
        setPiAvailable(false);
        return;
      }
      window.Pi.init({ version: "2.0", sandbox: true }); 
    };
    initPi();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("pigigs_token");
    const storedUser = localStorage.getItem("pigigs_user");
    if (storedToken && storedUser) {
      setJwtToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const login = async () => {
    if (!window.Pi) {
      alert("يرجى فتح هذا التطبيق داخل متصفح Pi الرسمي");
      return;
    }
    try {
      const scopes = ["username", "payments"];
      const auth = await window.Pi.authenticate(scopes, () => {});
      const token = auth.accessToken; 
      if (!token) throw new Error("No access token");

      const res = await fetch("/api/auth/pi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("pigigs_token", data.token);
        localStorage.setItem("pigigs_user", data.username);
        setJwtToken(data.token);
        setUser(data.username);
      } else {
        alert("فشل تسجيل الدخول");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تسجيل الدخول");
    }
  };

  const logout = () => {
    localStorage.removeItem("pigigs_token");
    localStorage.removeItem("pigigs_user");
    setUser(null);
    setJwtToken(null);
  };

  const addService = async (formData) => {
    if (!jwtToken) return;
    const res = await fetch("/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const newService = await res.json();
      setServices([newService, ...services]);
      setShowForm(false);
    } else {
      const err = await res.json();
      alert(err.error || "فشلت إضافة الخدمة");
    }
  };

  const buyService = async (service) => {
    if (!jwtToken || !user) {
      alert("يجب تسجيل الدخول أولاً");
      return;
    }
    if (!window.Pi) {
      alert("متصفح Pi غير مدعوم");
      return;
    }

    const paymentData = {
      amount: service.price,
      memo: lang === "ar" ? service.title : service.titleEn,
      metadata: JSON.stringify({
        serviceId: service.id,
        buyerUsername: user,
      }),
    };

    window.Pi.createPayment(paymentData, {
      onReadyForServerApproval: async (paymentId) => {
        await fetch("/api/pi/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        const res = await fetch("/api/pi/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid }),
        });
        if (res.ok) {
          alert("تمت عملية الشراء بنجاح ✅");
        } else {
          alert("فشلت عملية إكمال الدفع");
        }
      },
      onCancel: () => alert("تم الإلغاء"),
      onError: (err) => alert("خطأ: " + err.message),
    });
  };

  const categories = ["الكل", "تصميم", "كتابة", "برمجة", "منتجات رقمية"];
  const filtered = services.filter((s) => {
    const text = (lang === "ar" ? s.title : s.titleEn)?.toLowerCase() || "";
    return text.includes(search.toLowerCase()) && (category === "الكل" || s.category === category);
  });

  if (!piAvailable) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-bold text-red-600">⚠️ متصفح غير مدعوم</h2>
          <p className="mt-2">يرجى فتح هذا التطبيق من خلال <strong>متصفح Pi Network</strong> الرسمي.</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-800">PiGigs</h1>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="px-3 py-1 border rounded-lg">🌐 {lang.toUpperCase()}</button>
          {user ? (
            <>
              <span className="px-3 py-1 text-gray-600">👤 {user}</span>
              <button onClick={() => setShowForm(true)} className="px-4 py-1 bg-purple-700 text-white rounded-lg">➕ {lang === "ar" ? "أضف خدمة" : "Add"}</button>
              <button onClick={logout} className="px-4 py-1 border rounded-lg">🚪 خروج</button>
            </>
          ) : (
            <button onClick={login} className="px-4 py-1 bg-purple-700 text-white rounded-lg">🔐 {lang === "ar" ? "دخول بـ Pi" : "Login with Pi"}</button>
          )}
        </div>
      </header>

      <div className="p-4 max-w-6xl mx-auto">
        <input type="text" placeholder={lang === "ar" ? "ابحث..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-3 border rounded-xl mb-4" />
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-lg ${category === cat ? "bg-purple-700 text-white" : "bg-white border"}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-10">جاري التحميل...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="relative w-full h-40 mb-3">
                <Image src={service.image} alt="" fill className="object-cover rounded-lg" unoptimized />
              </div>
              <h3 className="font-bold text-lg mb-1">{lang === "ar" ? service.title : service.titleEn}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{lang === "ar" ? service.description : service.descriptionEn}</p>
              <p className="text-sm text-gray-500 mb-3">@{service.seller_id}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-700">{service.price} Pi</span>
                <button onClick={() => buyService(service)} className="px-4 py-2 bg-purple-700 text-white rounded-lg disabled:opacity-50" disabled={!user}>
                  {lang === "ar" ? "شراء" : "Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && <AddServiceForm onSubmit={addService} onClose={() => setShowForm(false)} lang={lang} />}
    </div>
  );
}
```