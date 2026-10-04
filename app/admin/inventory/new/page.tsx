'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormData {
  brand: string;
  title: string;
  category: string;
  price: string;
  conditionGrade: 'Pristine' | 'Excellent' | 'Very Good' | 'Good';
  hardwareCondition: string;
  materialCondition: string;
  serialNumber: string;
  description: string;
  images: File[];
  video: File | null;
}

export default function NewInventoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    brand: '',
    title: '',
    category: 'Handbags',
    price: '',
    conditionGrade: 'Pristine',
    hardwareCondition: 'No visible scratches, protective film attached',
    materialCondition: 'Unworn structure, zero corner scuffing',
    serialNumber: '',
    description: '',
    images: [],
    video: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...filesArray] }));

    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setFormData((prev) => ({ ...prev, video: file }));
    setPreviewVideo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach((file) => data.append('images', file));
        } else if (key === 'video' && formData.video) {
          data.append('video', formData.video);
        } else {
          data.append(key, value as string);
        }
      });

      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Failed to create inventory item');

      router.push('/admin/inventory');
      router.refresh();
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Error uploading luxury item. Check logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-neutral-900 bg-white min-h-screen">
      <div className="flex justify-between items-center pb-6 mb-8 border-b border-neutral-200">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-600">
            Vaulted Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Add Vaulted Inventory</h1>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-medium px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50 transition"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Meta Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              required
              placeholder="e.g. Chanel, Louis Vuitton, Apple"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Product Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Classic Flap Medium — Caviar"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="Handbags">Handbags & Leather Goods</option>
              <option value="Watches">Watches & Jewelry</option>
              <option value="Electronics">Electronics & Tech</option>
              <option value="Apparel">Footwear & Outerwear</option>
            </select>
          </div>
        </div>

        {/* Pricing & Serial Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Price (USD $)</label>
            <input
              type="number"
              name="price"
              required
              placeholder="6450"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
              Serial Number / NFC Microchip ID
            </label>
            <input
              type="text"
              name="serialNumber"
              placeholder="e.g. 31XXXXXX or Microchip ID"
              value={formData.serialNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* Loupe & Grading Section */}
        <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200 space-y-6">
          <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-800">
            Authentication & Condition Grading
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Overall Grade</label>
              <select
                name="conditionGrade"
                value={formData.conditionGrade}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Pristine">Pristine (Store Fresh / Like New)</option>
                <option value="Excellent">Excellent (Minor handling traces)</option>
                <option value="Very Good">Very Good (Light cosmetic wear)</option>
                <option value="Good">Good (Noticeable wear, fully functional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Hardware Score</label>
              <input
                type="text"
                name="hardwareCondition"
                value={formData.hardwareCondition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Material Wear</label>
              <input
                type="text"
                name="materialCondition"
                value={formData.materialCondition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Media Upload (Loupe Photos & Video Preview) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
              High-Res Loupe Photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800"
            />
            {previewImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {previewImages.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx}`}
                    className="w-full h-20 object-cover rounded border border-neutral-200"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Video Attachment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
              Inspection Video Showcase (.MP4)
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoUpload}
              className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800"
            />
            {previewVideo && (
              <video
                src={previewVideo}
                controls
                className="w-full h-28 mt-4 rounded border border-neutral-200 bg-black"
              />
            )}
          </div>
        </div>

        {/* Full Condition Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
            Detailed Provenance & Condition Notes
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Include provenance, included accessories (box, dust bag, receipt), and specific callouts visible under magnification."
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Submit CTA */}
        <div className="pt-4 border-t border-neutral-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-neutral-900 text-white font-medium text-xs tracking-widest uppercase rounded hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating & Publishing...' : 'Publish to Vault'}
          </button>
        </div>
      </form>
    </div>
  );
}
