import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { StudentReport } from '~/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
});

interface StudentReportPDFProps {
  data: StudentReport;
}

const StudentReportPDF: React.FC<StudentReportPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Student Report</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{data.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Grade:</Text>
          <Text style={styles.value}>{data.grade}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>School:</Text>
          <Text style={styles.value}>{data.school}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Roll Number/ID:</Text>
          <Text style={styles.value}>{data.rollNumber}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Subjects and Grades:</Text>
        {data.subjects.map((subject, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{subject.name}:</Text>
            <Text style={styles.value}>{subject.grade}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default StudentReportPDF;