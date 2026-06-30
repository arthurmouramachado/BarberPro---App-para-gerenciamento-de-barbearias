import { StyleSheet, Text, View, TextInput, TextInputProps } from 'react-native'
import React from 'react'

export function Input({...rest}: TextInputProps) {
    return (
      <TextInput {...rest} />
  )
};
