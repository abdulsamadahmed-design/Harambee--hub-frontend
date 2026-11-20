import { useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/useAuth'
import Button from '../common/Button'
import Input from '../common/Input'

export default function PledgeForm({ campaignId, onSuccess }) {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const contributorName =
    user?.name || user?.full_name || user?.username || 'Your account'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount < 1) {
      setError('Enter a valid pledge amount of at least KSh 1.')
      return
    }

    if (numericAmount > 10000000) {
      setError('The maximum pledge amount is KSh 10,000,000.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post(`/pledges/campaign/${campaignId}`, {
        amount: numericAmount,
        message: message.trim(),
      })

      setAmount('')
      setMessage('')

      if (onSuccess) {
        onSuccess(response.pledge)
      }
    } catch (err) {
      setError(err.message || 'Could not submit your pledge.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="pledge-form" onSubmit={handleSubmit}>
      <h2>Make a contribution</h2>

      <p>
        This pledge will be recorded under <strong>{contributorName}</strong>.
      </p>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <Input
        label="Pledge amount (KSh)"
        name="amount"
        type="number"
        min="1"
        max="10000000"
        step="0.01"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Enter amount"
        required
        disabled={loading}
      />

      <div className="form-group">
        <label htmlFor="pledge-message">Message (optional)</label>
        <textarea
          id="pledge-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add a message with your pledge"
          rows="3"
          maxLength="500"
          disabled={loading}
        />
      </div>

      <Button type="submit" loading={loading} disabled={!campaignId}>
        Submit pledge
      </Button>
    </form>
  )
}
