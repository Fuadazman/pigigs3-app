```javascript
"use client";
import { useState } from "react";

export default function AddServiceForm({ onSubmit, onClose, lang }) {
  const [form, setForm] = useState({
    title: "", titleEn: "", description: "", descriptionEn: "",
    price: "", category: "تصميم", image: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price || parseFloat(form.price) < 0.01) {
      alert("السعر يجب أن يكون 0.01 Pi على الأقل والعنوان مطلوب");
      return;
    }
    onSubmit({ ...form, price: parseFloat(form.price) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{lang === "ar" ? "إضافة خدمة جديدة" : "New Service"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="العنوان عربي" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2 border rounded-lg" required />
          <input type="text" placeholder="Title English" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full p-2 border rounded-lg" required />
          <textarea placeholder="الوصف عربي" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded-lg" required />
          <textarea placeholder="Description English" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="w-full p-2 border rounded-lg" required />
          <input type="number" step="0.01" min="0.01" placeholder="السعر Pi" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-2 border rounded-lg" required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-2 border rounded-lg">
            <option>تصميم</option><option>كتابة</option><option>برمجة</option><option>منتجات رقمية</option>
          </select>
          <input type="url" placeholder="رابط الصورة" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full p-2 border rounded-lg" required />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg font-bold">نشر</button>
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```
