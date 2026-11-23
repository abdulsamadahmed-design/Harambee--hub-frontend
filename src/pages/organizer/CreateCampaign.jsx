
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

function CreateCampaign() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    end_date: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

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
  }

  function validateForm() {
    const newErrors = {}

    if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must contain at least 3 characters.'
    }

    if (formData.title.trim().length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters.'
    }

    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must contain at least 10 characters.'
    }

    if (!formData.goal_amount || Number(formData.goal_amount) < 0.01) {
      newErrors.goal_amount = 'Enter a goal amount of at least KSh 0.01.'
    }

    if (
      formData.end_date &&
      new Date(`${formData.end_date}T23:59:59`) <= new Date()
    ) {
      newErrors.end_date = 'The end date must be in the future.'
    }

    return newErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateForm()
    setErrors(validationErrors)
    setServerError('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      goal_amount: Number(formData.goal_amount).toFixed(2),
      end_date: formData.end_date
        ? new Date(`${formData.end_date}T23:59:59`).toISOString()
        : null,
    }

    try {
      setSubmitting(true)

      await api.post('/campaigns/', payload)

      navigate('/organizer/campaigns')
    } catch (error) {
      setServerError(error.message || 'Failed to create campaign.')
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

      <form className="campaign-form" onSubmit={handleSubmit}>
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
            <p className="form-error">{errors.description}</p>
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
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" loading={submitting}>
            Create Campaign
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaign
