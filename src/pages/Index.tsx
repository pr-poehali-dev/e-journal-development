import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Student {
  id: number;
  name: string;
  grades: { [date: string]: string | number };
  averageGrade: number;
  attendance: number;
}

interface Subject {
  id: number;
  name: string;
  teacher: string;
}

interface Lesson {
  date: string;
  topic: string;
  homework: string;
}

const mockStudents: Student[] = [
  {
    id: 1,
    name: 'Иванов Алексей',
    grades: { '2024-09-15': 5, '2024-09-16': 4, '2024-09-17': 'Н', '2024-09-18': 5 },
    averageGrade: 4.7,
    attendance: 85
  },
  {
    id: 2,
    name: 'Петрова Мария',
    grades: { '2024-09-15': 4, '2024-09-16': 5, '2024-09-17': 'УП', '2024-09-18': 4 },
    averageGrade: 4.3,
    attendance: 95
  },
  {
    id: 3,
    name: 'Сидоров Николай',
    grades: { '2024-09-15': 3, '2024-09-16': 4, '2024-09-17': 3, '2024-09-18': 'Б' },
    averageGrade: 3.3,
    attendance: 78
  },
  {
    id: 4,
    name: 'Козлова Анна',
    grades: { '2024-09-15': 5, '2024-09-16': 'О', '2024-09-17': 4, '2024-09-18': 5 },
    averageGrade: 4.7,
    attendance: 90
  },
  {
    id: 5,
    name: 'Морозов Дмитрий',
    grades: { '2024-09-15': 2, '2024-09-16': 3, '2024-09-17': 'Н/А', '2024-09-18': 3 },
    averageGrade: 2.7,
    attendance: 70
  }
];

const mockSubjects: Subject[] = [
  { id: 1, name: 'Математика', teacher: 'Смирнова О.П.' },
  { id: 2, name: 'Русский язык', teacher: 'Козлова Е.А.' },
  { id: 3, name: 'Физика', teacher: 'Петров А.И.' }
];

const dates = ['2024-09-15', '2024-09-16', '2024-09-17', '2024-09-18'];

const mockLessons: { [date: string]: Lesson } = {
  '2024-09-15': { date: '2024-09-15', topic: 'Линейные уравнения', homework: 'Стр. 45, №12-18' },
  '2024-09-16': { date: '2024-09-16', topic: 'Системы уравнений', homework: 'Стр. 48, №20-25' },
  '2024-09-17': { date: '2024-09-17', topic: 'Графики функций', homework: 'Стр. 52, №30-35' },
  '2024-09-18': { date: '2024-09-18', topic: 'Контрольная работа №2', homework: 'Повторить главу 3' }
};

const gradeOptions = [1, 2, 3, 4, 5, 'Н', 'УП', 'Б', 'О', 'Н/А'];

const Index = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const [selectedSubject, setSelectedSubject] = useState('1');
  const [selectedClass, setSelectedClass] = useState('10А');
  const [students, setStudents] = useState(mockStudents);
  const [lessons, setLessons] = useState(mockLessons);
  const [editingCell, setEditingCell] = useState<{studentId: number, date: string} | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | number>('');

  const getGradeColor = (grade: string | number) => {
    if (typeof grade === 'number') {
      if (grade >= 5) return 'bg-success text-success-foreground';
      if (grade >= 4) return 'bg-primary text-primary-foreground';
      if (grade >= 3) return 'bg-warning text-warning-foreground';
      if (grade >= 2) return 'bg-orange-500 text-white';
      return 'bg-destructive text-destructive-foreground';
    }
    
    switch (grade) {
      case 'Н': return 'bg-destructive text-destructive-foreground';
      case 'УП': return 'bg-muted text-muted-foreground';
      case 'Б': return 'bg-blue-500 text-white';
      case 'О': return 'bg-yellow-500 text-white';
      case 'Н/А': return 'bg-gray-400 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const updateGrade = (studentId: number, date: string, grade: string | number) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const newGrades = { ...student.grades, [date]: grade };
        const numericGrades = Object.values(newGrades).filter(g => typeof g === 'number') as number[];
        const averageGrade = numericGrades.length > 0 
          ? numericGrades.reduce((sum, g) => sum + g, 0) / numericGrades.length 
          : 0;
        return { ...student, grades: newGrades, averageGrade };
      }
      return student;
    }));
    setEditingCell(null);
  };

  const updateLesson = (date: string, field: 'topic' | 'homework', value: string) => {
    setLessons(prev => ({
      ...prev,
      [date]: { ...prev[date], [field]: value }
    }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Ученик', ...dates.map(d => formatDate(d)), 'Средний балл', 'Посещаемость'],
      ...students.map(student => [
        student.name,
        ...dates.map(date => student.grades[date] || '—'),
        student.averageGrade.toFixed(1),
        `${student.attendance}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `журнал_${selectedClass}_${mockSubjects.find(s => s.id.toString() === selectedSubject)?.name}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-inter font-semibold text-gray-900">E-Journal</h1>
              <p className="text-sm text-gray-500">Электронный журнал успеваемости</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              <Icon name="User" size={14} className="mr-1" />
              Учитель
            </Badge>
            <Button variant="outline" size="sm">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
            <TabsTrigger value="journal" className="flex items-center space-x-2">
              <Icon name="BookOpen" size={16} />
              <span>Журнал</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} />
              <span>Расписание</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Icon name="BarChart3" size={16} />
              <span>Аналитика</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center space-x-2">
              <Icon name="Settings" size={16} />
              <span>Управление</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div>
                <h2 className="text-2xl font-inter font-semibold text-gray-900">Журнал оценок</h2>
                <p className="text-gray-600 mt-1">Выставление оценок и отметок посещаемости</p>
              </div>
              <div className="flex gap-3">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10А">10А класс</SelectItem>
                    <SelectItem value="10Б">10Б класс</SelectItem>
                    <SelectItem value="11А">11А класс</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспорт
                </Button>
              </div>
            </div>

            <Card className="animate-scale-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="BookOpen" size={20} />
                    <span>{mockSubjects.find(s => s.id.toString() === selectedSubject)?.name}</span>
                  </CardTitle>
                  <Badge variant="secondary">
                    {mockSubjects.find(s => s.id.toString() === selectedSubject)?.teacher}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48">Ученик</TableHead>
                        {dates.map((date) => (
                          <TableHead key={date} className="text-center min-w-20">
                            {formatDate(date)}
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Средний балл</TableHead>
                        <TableHead className="text-center">Посещаемость</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{student.name}</TableCell>
                          {dates.map((date) => (
                            <TableCell key={date} className="text-center">
                              {editingCell?.studentId === student.id && editingCell?.date === date ? (
                                <Select
                                  value={selectedGrade.toString()}
                                  onValueChange={(value) => {
                                    const grade = isNaN(Number(value)) ? value : Number(value);
                                    updateGrade(student.id, date, grade);
                                  }}
                                  open={true}
                                  onOpenChange={(open) => {
                                    if (!open) setEditingCell(null);
                                  }}
                                >
                                  <SelectTrigger className="w-16 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {gradeOptions.map((option) => (
                                      <SelectItem key={option} value={option.toString()}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`min-w-8 h-8 p-0 ${getGradeColor(student.grades[date] || '')}`}
                                  onClick={() => {
                                    setEditingCell({ studentId: student.id, date });
                                    setSelectedGrade(student.grades[date] || '');
                                  }}
                                >
                                  {student.grades[date] || '—'}
                                </Button>
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              {student.averageGrade.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={student.attendance >= 90 ? 'default' : student.attendance >= 80 ? 'secondary' : 'destructive'}
                            >
                              {student.attendance}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dates.map((date) => (
                      <Card key={date} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{formatDate(date)}</h4>
                          <Badge variant="outline">{new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' })}</Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Тема урока:</label>
                            <Input
                              value={lessons[date]?.topic || ''}
                              onChange={(e) => updateLesson(date, 'topic', e.target.value)}
                              placeholder="Введите тему урока"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Домашнее задание:</label>
                            <Textarea
                              value={lessons[date]?.homework || ''}
                              onChange={(e) => updateLesson(date, 'homework', e.target.value)}
                              placeholder="Введите домашнее задание"
                              className="text-sm min-h-16"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Обозначения оценок:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-success rounded text-white text-xs flex items-center justify-center">5</div>
                        <span className="text-sm text-gray-600">Отлично</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary rounded text-white text-xs flex items-center justify-center">4</div>
                        <span className="text-sm text-gray-600">Хорошо</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-warning rounded text-white text-xs flex items-center justify-center">3</div>
                        <span className="text-sm text-gray-600">Удовлетворительно</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-500 rounded text-white text-xs flex items-center justify-center">2</div>
                        <span className="text-sm text-gray-600">Неудовлетворительно</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-destructive rounded text-white text-xs flex items-center justify-center">1</div>
                        <span className="text-sm text-gray-600">Очень плохо</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-destructive rounded text-white text-xs flex items-center justify-center">Н</div>
                        <span className="text-sm text-gray-600">Не был</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-muted rounded text-muted-foreground text-xs flex items-center justify-center">УП</div>
                        <span className="text-sm text-gray-600">Уважительная причина</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">Б</div>
                        <span className="text-sm text-gray-600">Болел</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded text-white text-xs flex items-center justify-center">О</div>
                        <span className="text-sm text-gray-600">Опоздание</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-400 rounded text-white text-xs flex items-center justify-center">Н/А</div>
                        <span className="text-sm text-gray-600">Не оценивалось</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-inter font-semibold text-gray-900">Аналитика успеваемости</h2>
                <p className="text-gray-600 mt-1">Статистика и отчеты по классу</p>
              </div>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт отчета
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="animate-scale-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Средний балл класса</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-inter font-bold text-primary">4.1</div>
                  <div className="flex items-center mt-2 text-sm text-success">
                    <Icon name="TrendingUp" size={14} className="mr-1" />
                    +0.2 с прошлого месяца
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Общая посещаемость</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-inter font-bold text-success">84%</div>
                  <div className="flex items-center mt-2 text-sm text-destructive">
                    <Icon name="TrendingDown" size={14} className="mr-1" />
                    -3% с прошлого месяца
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Отличников</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-inter font-bold text-success">2</div>
                  <div className="text-sm text-gray-600 mt-2">из 5 учеников</div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Пропусков за неделю</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-inter font-bold text-warning">6</div>
                  <div className="text-sm text-gray-600 mt-2">3 уважительных, 3 нет</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="BarChart3" size={20} />
                    <span>Распределение оценок</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Отлично (5)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-6/12 h-full bg-success"></div>
                        </div>
                        <span className="text-sm font-mono">30%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Хорошо (4)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-5/12 h-full bg-primary"></div>
                        </div>
                        <span className="text-sm font-mono">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Удовлетв. (3)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-4/12 h-full bg-warning"></div>
                        </div>
                        <span className="text-sm font-mono">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Неудовлетв. (2)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-2/12 h-full bg-orange-500"></div>
                        </div>
                        <span className="text-sm font-mono">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Clock" size={20} />
                    <span>Статистика посещаемости</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Присутствовали</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-10/12 h-full bg-success"></div>
                        </div>
                        <span className="text-sm font-mono">84%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Уважительная причина</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-2/12 h-full bg-muted"></div>
                        </div>
                        <span className="text-sm font-mono">8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Прогулы</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-1/12 h-full bg-destructive"></div>
                        </div>
                        <span className="text-sm font-mono">5%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Опоздания</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-1/12 h-full bg-warning"></div>
                        </div>
                        <span className="text-sm font-mono">3%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-inter font-semibold text-gray-900">Расписание уроков</h2>
              <p className="text-gray-600 mt-1">Управление расписанием и темами уроков</p>
            </div>
            
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Icon name="Calendar" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Расписание в разработке</h3>
                  <p className="text-gray-600">Функция управления расписанием будет добавлена в следующих версиях</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-inter font-semibold text-gray-900">Управление системой</h2>
              <p className="text-gray-600 mt-1">Настройки пользователей, предметов и классов</p>
            </div>
            
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Icon name="Settings" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Панель управления в разработке</h3>
                  <p className="text-gray-600">Функции управления пользователями и настройками будут добавлены в следующих версиях</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;