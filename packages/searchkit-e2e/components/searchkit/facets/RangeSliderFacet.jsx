import React, { useEffect, useState } from 'react'
import { EuiTitle, EuiDualRange } from '@elastic/eui'
import { useSearchkit } from '@searchkit/client'
import { useDebouncedCallback } from 'use-debounce'

export const getLevels = (entries) => {
  const counts = entries.reduce((sum, entry) => {
    if (entry.count > 0) {
      return [...sum, parseInt(entry.label)]
    }
    return sum
  }, [])
  if (counts.length > 0) {
    return { min: Math.min(...counts), max: Math.max(...counts) }
  }
  return { min: 0, max: 0 }
}

export const RangeSliderFacet = ({ facet, loading }) => {
  const api = useSearchkit()
  const [dualValue, setDualValue] = useState([0, 100])
  const selectedOptions = api.getFilterById(facet.id)

  const [debouncedCallback] = useDebouncedCallback((value) => {
    api.setFilter({
      id: facet.id,
      min: value[0],
      max: value[1]
    })
    api.search()
  }, 400)

  useEffect(() => {
    if (selectedOptions) {
      setDualValue([selectedOptions.min, selectedOptions.max])
    }
  }, [selectedOptions])

  const range = getLevels(facet.entries)

  const levels = [
    {
      min: 0,
      max: range.min,
      color: 'warning'
    },
    {
      min: range.min,
      max: range.max,
      color: 'primary'
    },
    {
      min: range.max,
      max: 100,
      color: 'warning'
    }
  ]

  return (
    <>
      <EuiTitle size="xxs">
        <h3>{facet.label}</h3>
      </EuiTitle>
      <EuiDualRange
        id={facet.id}
        value={dualValue}
        onChange={(value) => {
          setDualValue(value)
          debouncedCallback(value)
        }}
        levels={levels}
      />
    </>
  )
}

RangeSliderFacet.DISPLAY = 'RangeSlider'