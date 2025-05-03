import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Camera, X, CheckCircle, Ban } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/AuthContext';

interface GrievanceFormData {
  description: string;
  location: string;
  image?: FileList;
}

const GrievanceReporting: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<GrievanceFormData>();

  const onSubmit = async (data: GrievanceFormData) => {
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('location', data.location);
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]); // ✅ must be 'image'
      }

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/grievances', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          reset();
          setPreviewImage(null);
          setIsSubmitted(false);
        }, 3000);
      } else {
        alert('❌ Submission failed: ' + result.message);
      }
    } catch (err) {
      console.error('Grievance submission error:', err);
      alert('❌ Something went wrong!');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    reset({ image: undefined });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center text-red-600 mt-12 text-lg font-medium">
        <Ban className="inline-block mr-2 text-red-500" />
        You must be logged in to submit a grievance.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={t('grievance.title')}
        subtitle={t('grievance.subtitle')}
        instructionKey="grievance.voiceInstructions"
      />

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-700">
              {t('grievance.submitSuccess')}
            </h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('grievance.problemDesc')} *
              </label>
              <textarea
                id="description"
                {...register('description', {
                  required: t('grievance.form.requiredField') as string,
                  minLength: {
                    value: 20,
                    message: t('grievance.form.minLength') as string
                  }
                })}
                placeholder={t('grievance.form.descPlaceholder') as string}
                rows={5}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                  focus:outline-none focus:ring-primary-500 focus:border-primary-500
                  ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                {t('grievance.location')} *
              </label>
              <input
                type="text"
                id="location"
                {...register('location', { required: t('grievance.form.requiredField') as string })}
                placeholder={t('grievance.form.locPlaceholder') as string}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                  focus:outline-none focus:ring-primary-500 focus:border-primary-500
                  ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('grievance.uploadImage')}
              </label>
              {previewImage ? (
                <div className="relative mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-48 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Camera size={48} className="mx-auto text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                      >
                        <span>{t('Upload')}</span>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          {...register('image')}
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">{t('or DragDrop')}</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => reset()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('common.reset')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('common.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GrievanceReporting;
