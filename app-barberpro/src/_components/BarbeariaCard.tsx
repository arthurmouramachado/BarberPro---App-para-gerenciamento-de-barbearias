import { StyleSheet, Text, View, TouchableOpacity,TouchableOpacityProps, Image } from 'react-native'
import { BarbeariaCardDTO } from '../services/barbeariaService'
import React from 'react'

interface BarbeariaCardProps extends TouchableOpacityProps{
    barbearia: BarbeariaCardDTO;
}

export function BarbeariaCard({ barbearia, style, ...rest }: BarbeariaCardProps) {
  return (
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.8}
        {...rest}
        >

            <Image source={{ uri: barbearia.foto_url }} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.title}>{barbearia.nome}</Text>
                <Text style={styles.subtitle}>{barbearia.endereco}</Text>
                <Text style={styles.subtitle}>{barbearia.diaEHorario}</Text>
            </View>

            <View style={styles.divider}></View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{barbearia.mediaAvaliacoes}</Text>
                {barbearia.distanciaKM && <Text style={styles.footerText}>{barbearia.distanciaKM} km</Text>}
            </View>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#FFF',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
    },
    image:{
        width: '100%',
        height: 180,
    },
    content:{
        padding: 16,
    },
    title:{
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
    },
    subtitle:{
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        marginBottom: 4,
    },
    divider:{
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    footer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    footerText:{
        fontSize: 14,
    }
})