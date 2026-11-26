
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import api from '../../services/api'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

function readImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(
      new Error('Could not preview this image.')
    )

    reader.readAsDataURL(file)
  })
}

function CreateCampaign() {
  const navigate = useNavigate()
  const imageInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    end_date: '',
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }))

    setServerError('')
  }

  async function handleImageChange(event) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) return

    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setServerError('')

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError(
        'Only JPEG, PNG, and WebP images are allowed.'
      )
      input.value = ''
      return
    }

    setIsCompressing(true)

    try {
      let processedFile = file

      if (file.size > MAX_IMAGE_SIZE) {
        processedFile = await imageCompression(file, {
          maxSizeMB: 4.5,
          maxWidthOrHeight: 1920,
          initialQuality: 0.82,
          maxIteration: 10,
          useWebWorker: true,
          fileType: file.type,
        })
      }

      if (processedFile.size > MAX_IMAGE_SIZE) {
        throw new Error(
          'The image is still larger than 5MB after compression. Please choose a smaller image.'
        )
      }

      const extension = IMAGE_EXTENSIONS[processedFile.type]

      if (!extension) {
        throw new Error('Unsupported image format.')
      }

      const baseName = file.name.replace(/\.[^/.]+$/, '')

      const finalFile = new File(
        [processedFile],
        `${baseName}${extension}`,
        {
          type: processedFile.type,
          lastModified: Date.now(),
        }
      )

      const preview = await readImagePreview(finalFile)

      setImageFile(finalFile)
      setImagePreview(preview)

    } catch (error) {
      setImageFile(null)
      setImagePreview('')
      setImageError(
        error.message || 'Image processing failed. Please try another image.'
      )
      input.value = ''
    } finally {
      setIsCompressing(false)
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setServerError('')

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  function validateForm() {
    const newErrors = {}

    if (formData.title.trim().length < 3) {
      newErrors.title =
        'Title must contain at least 3 characters.'
    }

    if (formData.title.trim().length > 150) {
      newErrors.title =
        'Title cannot exceed 150 characters.'
    }

    if (formData.description.trim().length < 10) {
      newErrors.description =
        'Description must contain at least 10 characters.'
    }

    const goal = Number(formData.goal_amount)

    if (
      !formData.goal_amount ||
      !Number.isFinite(goal) ||
      goal < 0.01
    ) {
      newErrors.goal_amount =
        'Enter a goal amount of at least KSh 0.01.'
    }

    if (
      formData.end_date &&
      new Date(`${formData.end_date}T23:59:59`) <= new Date()
    ) {
      newErrors.end_date =
        'The end date must be in the future.'
    }

    return newErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setServerError('')

    if (submitting) return

    if (isCompressing) {
      setServerError(
        'Please wait while your image is being optimized.'
      )
      return
    }

    const validationErrors = validateForm()

    setErrors(validationErrors)

    const blockingErrors = [
      ...Object.values(validationErrors),
      ...(imageError ? [imageError] : []),
    ]

    if (blockingErrors.length > 0) {
      setServerError(
        `Campaign not submitted: ${blockingErrors.join(' ')}`
      )
      return
    }

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
      setImageError('Image must not exceed 5MB.')
      return
    }

    const campaignData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      goal_amount: Number(formData.goal_amount).toFixed(2),
      end_date: formData.end_date
        ? new Date(
            `${formData.end_date}T23:59:59`
          ).toISOString()
        : null,
    }

    let payload = campaignData

    if (imageFile) {
      payload = new FormData()

      Object.entries(campaignData).forEach(([key, value]) => {
        if (value !== null) {
          payload.append(key, value)
        }
      })

      payload.append('image', imageFile)
    }

    try {
      setSubmitting(true)

      await api.post('/campaigns/', payload)

      navigate('/organizer/campaigns')
    } catch (error) {
      setServerError(
        error.message || 'Failed to create campaign. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-campaign">
      <div className="page-heading">
        <div>
          <h2>Create a Campaign</h2>
          <p>Fill in the details below to start your campaign.</p>
        </div>
      </div>

      {serverError && (
        <div className="form-error" role="alert">
          {serverError}
        </div>
      )}

      <form
        className="campaign-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <Input
          label="Campaign Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter campaign title"
          error={errors.title}
          required
        />

        <div className="form-group">
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain what your campaign is about..."
            rows="5"
            required
          />

          {errors.description && (
            <p className="form-error">
              {errors.description}
            </p>
          )}
        </div>

        <Input
          label="Fundraising Goal (KSh)"
          name="goal_amount"
          type="number"
          value={formData.goal_amount}
          onChange={handleChange}
          placeholder="e.g. 50000"
          error={errors.goal_amount}
          required
        />

        <div className="form-group">
          <label htmlFor="campaign-image">
            Campaign Image (optional)
          </label>

          <input
            ref={imageInputRef}
            id="campaign-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={isCompressing || submitting}
          />

          <small>
            JPEG, PNG or WebP. Images larger than 5MB are
            automatically compressed before uploading.
          </small>

          {isCompressing && (
            <p>Optimizing image, please wait...</p>
          )}

          {imageError && (
            <p className="form-error" role="alert">
              {imageError}
            </p>
          )}

          {imagePreview && imageFile && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="Campaign preview"
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: '250px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginTop: '12px',
                }}
              />

              <small>
                Image ready: {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
              </small>

              <Button
                type="button"
                variant="secondary"
                onClick={removeImage}
                disabled={submitting || isCompressing}
              >
                Remove Image
              </Button>
            </div>
          )}
        </div>

        <Input
          label="End Date (optional)"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
          error={errors.end_date}
        />

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/organizer/campaigns')}
            disabled={submitting || isCompressing}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={submitting || isCompressing}
            disabled={submitting || isCompressing}
          >
            {isCompressing
              ? 'Optimizing Image...'
              : submitting
                ? 'Creating Campaign...'
                : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaign
