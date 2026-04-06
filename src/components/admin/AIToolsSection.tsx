import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToImageKit } from '../../lib/imagekit';
import { Trash2, Plus, Edit2, Upload } from 'lucide-react';

interface AITool {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  published: boolean;
  createdAt: any;
  updatedAt: any;
}

export function AIToolsSection() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    published: true,
  });

  useEffect(() => {
    setLoading(true);
    const toolsCollection = collection(db, 'ai_tools');

    const unsubscribe = onSnapshot(toolsCollection, (snapshot) => {
      const toolsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AITool));

      setTools(toolsData.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bDate - aDate;
      }));

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price) {
      alert('Please fill in all fields');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = imagePreview;

      // Upload image to ImageKit if provided
      if (imageFile) {
        imageUrl = await uploadToImageKit(imageFile);
      }

      const toolData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        published: formData.published,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'ai_tools', editingId), toolData);
      } else {
        await addDoc(collection(db, 'ai_tools'), {
          ...toolData,
          createdAt: serverTimestamp(),
        });
      }

      setFormData({ name: '', description: '', price: '', published: true });
      setImageFile(null);
      setImagePreview('');
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding/updating tool:', error);
      alert('Failed to save tool. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (tool: AITool) => {
    setFormData({
      name: tool.name,
      description: tool.description,
      price: tool.price.toString(),
      published: tool.published,
    });
    setImagePreview(tool.image);
    setEditingId(tool.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      try {
        await deleteDoc(doc(db, 'ai_tools', id));
      } catch (error) {
        console.error('Error deleting tool:', error);
        alert('Failed to delete tool');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', published: true });
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Tools Management</h2>
          <p className="text-gray-600 mt-1">Total tools: {tools.length}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Tool
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-8 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900">
            {editingId ? 'Edit AI Tool' : 'Add New AI Tool'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tool Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                    >
                      <Upload className="w-4 h-4" />
                      Change Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center w-full py-8 text-gray-600"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-semibold">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, up to 5MB</p>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tool Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g., ChatGPT Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₦)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="29.99"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Describe the tool and its features..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 border border-gray-300 rounded focus:outline-none"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">
                Publish immediately
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {uploading ? 'Saving...' : editingId ? 'Update Tool' : 'Add Tool'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tools Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading tools...</div>
      ) : tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                {tool.image ? (
                  <img src={tool.image} alt={tool.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900">{tool.name}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tool.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-bold text-gray-900">₦{tool.price.toFixed(2)}</p>
                    <p className={`text-xs font-semibold ${tool.published ? 'text-green-600' : 'text-yellow-600'}`}>
                      {tool.published ? 'Published' : 'Draft'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tool)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No AI tools yet. Create one to get started!</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create First Tool
          </button>
        </div>
      )}
    </div>
  );
}
