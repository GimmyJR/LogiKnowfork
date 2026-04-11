'use client';

import { useState, useEffect } from 'react';
import { BookDto, BooksService } from '@/api/client';
import { Loader2, Save, X, Plus, Trash2, BookOpen, User, Hash, Globe, Tag, Link, Image as ImageIcon, FileUp, Database, Upload, CheckCircle2 } from 'lucide-react';

interface BookFormProps {
  initialData?: BookDto;
  onSuccess: (book: BookDto) => void;
  onCancel: () => void;
}

export default function BookForm({ initialData, onSuccess, onCancel }: BookFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    authors: initialData?.authors || [''],
    year: initialData?.year || new Date().getFullYear(),
    isbn: initialData?.isbn || '',
    language: initialData?.language || 'ar',
    category: initialData?.category || 'General',
    coverUrl: initialData?.coverUrl || '',
    externalLink: initialData?.externalLink || '',
    isPublished: initialData?.isPublished ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleAuthorChange = (index: number, value: string) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = value;
    setFormData(prev => ({ ...prev, authors: newAuthors }));
  };

  const addAuthor = () => {
    setFormData(prev => ({ ...prev, authors: [...prev.authors, ''] }));
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length <= 1) return;
    const newAuthors = formData.authors.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, authors: newAuthors }));
  };

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!selectedFile || !initialData?.id) return;
    setUploadLoading(true);
    setError('');
    try {
      await BooksService.uploadBook(initialData.id, selectedFile);
      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Failed to upload PDF.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean up authors (remove empty strings)
      const cleanedAuthors = formData.authors.filter(a => a.trim() !== '');
      if (cleanedAuthors.length === 0) {
        setError('At least one author is required.');
        setLoading(false);
        return;
      }

      const payload = { ...formData, authors: cleanedAuthors };
      
      let result;
      if (initialData?.id) {
        const { data } = await BooksService.updateBook(initialData.id, payload);
        result = data.data;
      } else {
        const { data } = await BooksService.addBook(payload);
        result = data.data;
      }
      
      onSuccess(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'An error occurred while saving the book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-manar-cyan" />
            Book Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all"
            placeholder="e.g. The Great Gatsby"
          />
        </div>

        {/* Authors */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-manar-cyan" />
            Authors
          </label>
          <div className="space-y-2">
            {formData.authors.map((author, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => handleAuthorChange(index, e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all"
                  placeholder="Author Name"
                />
                {formData.authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAuthor}
              className="flex items-center gap-2 text-manar-cyan hover:text-white text-sm font-medium transition-colors pl-1"
            >
              <Plus className="w-4 h-4" />
              Add another author
            </button>
          </div>
        </div>

        {/* Year & ISBN */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <Hash className="w-4 h-4 text-manar-cyan" />
            Year
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <Hash className="w-4 h-4 text-manar-cyan" />
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all"
            placeholder="Optional"
          />
        </div>

        {/* Language & Category */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-manar-cyan" />
            Language
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all appearance-none"
          >
            <option value="ar" className="bg-slate-900">Arabic</option>
            <option value="en" className="bg-slate-900">English</option>
            <option value="fr" className="bg-slate-900">French</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-manar-cyan" />
            Category
          </label>
          <input
            type="text"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all"
            placeholder="e.g. Science, Philosophy"
          />
        </div>

        {/* Cover URL & External Link */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-manar-cyan" />
            Cover Image URL
          </label>
          <input
            type="url"
            name="coverUrl"
            value={formData.coverUrl}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all"
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-white/60 text-sm font-medium flex items-center gap-2">
            <Link className="w-4 h-4 text-manar-cyan" />
            External Link
          </label>
          <input
            type="url"
            name="externalLink"
            value={formData.externalLink}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-manar-cyan outline-none transition-all"
            placeholder="Optional external URL"
          />
        </div>

        {/* Is Published */}
        <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="w-5 h-5 rounded border-white/20 bg-black/40 text-manar-cyan focus:ring-manar-cyan"
          />
          <label htmlFor="isPublished" className="text-white font-medium cursor-pointer">
            Published (Visible to all users)
          </label>
        </div>

        {/* PDF Upload (Only for existing books) */}
        {initialData?.id && (
          <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-white font-bold flex items-center gap-2">
              <FileUp className="w-5 h-5 text-manar-gold" />
              Content & indexing
            </h3>
            <p className="text-white/40 text-sm">Upload a PDF to enable semantic search and quote discovery within this book.</p>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-manar-cyan/10 file:text-manar-cyan hover:file:bg-manar-cyan/20 cursor-pointer"
                />
                {initialData.blobStoragePath && !selectedFile && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    PDF Uploaded
                  </span>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={uploadLoading || !selectedFile}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-manar-gold/20 hover:bg-manar-gold/30 text-manar-gold border border-manar-gold/50 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {uploadLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                Upload PDF
              </button>
            </div>
            
            {uploadSuccess && (
              <p className="text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                PDF uploaded and processed. Don't forget to trigger re-indexing from the books list!
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl bg-manar-cyan/20 hover:bg-manar-cyan/30 text-manar-cyan border border-manar-cyan/50 font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {initialData ? 'Update Book' : 'Create Book'}
        </button>
      </div>
    </form>
  );
}
