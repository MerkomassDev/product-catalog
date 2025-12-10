import React, { useState } from 'react';

function ProductForm({ product, categories, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || '',
    image_url: product?.image_url || '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Název je povinný';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Název musí mít alespoň 3 znaky';
    }

    if (!formData.price) {
      newErrors.price = 'Cena je povinná';
    } else if (parseFloat(formData.price) < 0) {
      newErrors.price = 'Cena musí být kladné číslo';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Kategorie je povinná';
    }

    if (!formData.stock && formData.stock !== 0) {
      newErrors.stock = 'Skladem je povinné';
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = 'Skladem musí být nezáporné číslo';
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Neplatná URL adresa';
    }

    return newErrors;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
    } catch (error) {
      alert('Chyba při ukládání produktu: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {product ? '✏️ Upravit produkt' : '➕ Nový produkt'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Název produktu *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="např. iPhone 14 Pro"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Popis</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                placeholder="Podrobný popis produktu..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cena (Kč) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                placeholder="29990"
                step="0.01"
                min="0"
              />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Kategorie *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
                placeholder="např. Mobily"
                list="categories-list"
              />
              <datalist id="categories-list">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Skladem (ks) *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="form-control"
                placeholder="10"
                min="0"
              />
              {errors.stock && <div className="form-error">{errors.stock}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">URL obrázku</label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="form-control"
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && <div className="form-error">{errors.image_url}</div>}
              {formData.image_url && isValidUrl(formData.image_url) && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginTop: '10px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting ? 'Ukládání...' : (product ? '💾 Uložit změny' : '➕ Vytvořit produkt')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
