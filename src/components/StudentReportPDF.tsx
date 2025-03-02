
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { StudentReport } from '../types';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  studentInfo: {
    marginBottom: 20,
  },
  subjectTable: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 24,
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
  },
  tableCol: {
    width: '50%',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  gradeCol: {
    width: '20%',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  comments: {
    marginTop: 20,
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
});

interface StudentReportPDFProps {
  data: {
    name: string;
    grade: string;
    school: string;
    rollNumber: string;
    subjects: { name: string; grade: string }[];
  };
}

const StudentReportPDF: React.FC<StudentReportPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>{data.school}</Text>
        <Text style={styles.reportTitle}>Student Report Card</Text>
      </View>

      <View style={styles.studentInfo}>
        <Text style={styles.text}>
          <Text style={styles.bold}>Student Name: </Text>
          {data.name}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Grade: </Text>
          {data.grade}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Roll Number: </Text>
          {data.rollNumber}
        </Text>
      </View>

      <View style={styles.subjectTable}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCol}>
            <Text style={styles.text}>Subject</Text>
          </View>
          <View style={styles.gradeCol}>
            <Text style={styles.text}>Grade</Text>
          </View>
        </View>

        {data.subjects.map((subject, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{subject.name}</Text>
            </View>
            <View style={styles.gradeCol}>
              <Text style={styles.text}>{subject.grade}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.comments}>
        <Text style={[styles.text, styles.bold]}>Teacher's Comments:</Text>
        <Text style={styles.text}>
          The student has shown tremendous progress this semester and has consistently performed well in all subjects.
        </Text>
      </View>
    </Page>
  </Document>
);

export default StudentReportPDF;
