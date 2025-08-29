import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ViewStyle, TextStyle } from 'react-native';

interface CollapsibleProps extends PropsWithChildren {
  title: string;
  containerStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  iconColor?: string;
}

export function Collapsible({ 
  children, 
  title, 
  containerStyle,
  headerStyle,
  titleStyle,
  contentStyle,
  iconColor = "#666"
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.heading, 
          isOpen && styles.headingOpen, // Agregar estilo cuando está abierto
          headerStyle
        ]}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={iconColor}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  headingOpen: {
    backgroundColor: '#f3f4f6', // Fondo gris cuando está abierto
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Roboto',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
});
