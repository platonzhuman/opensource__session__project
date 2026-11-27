---
title: "Предсказание следующего символа: LSTM и seq2seq"
subject: "Искусственный интеллект"
source_notebook: "AI_bergant/12_предсказание_следующего_символа.ipynb"
source_recording: "нет, только ноутбук"
---

# Предсказание следующего символа: LSTM и seq2seq

## О чём эта запись

Практика состоит из двух частей. Первая — классическая задача предсказания следующего символа: есть алфавит `A…Z`, сеть получает одну букву и должна выдать следующую. Модель — номер буквы, делённый на длину алфавита, слой `LSTM(32)` и плотный слой с `softmax` на 26 выходов. Вторая часть — маленький «переводчик» на seq2seq: на вход подаётся число вида $d^2 + 1$, на выходе сеть должна восстановить $d$. Энкодер читает строку цифр, декодер по одному символу порождает ответ; обучение идёт по механизму teacher forcing, а генерация — жадно, по одному токену.

Общий смысл: показать, как рекуррентная сеть работает с последовательностью, как устроены состояния LSTM, чем отличается обучение seq2seq от генерации и почему предсказание следующего символа — универсальная формулировка для текста, кода и чисел.

## Главные идеи

- Предсказание следующего символа формулируется как многоклассовая классификация: вход — предыдущие символы, выход — распределение по алфавиту.
- RNN/LSTM хранит **состояние**, которое передаётся от шага к шагу; для одного символа на входе последовательность состоит из одного шага.
- Вход для `LSTM` имеет форму `(samples, timesteps, features)`; в первой задаче это `(25, 1, 1)`.
- `sparse_categorical_crossentropy` используется, когда метки — целые номера классов, а не one-hot векторы.
- `softmax` превращает выходы в вероятности; `argmax` выбирает самый вероятный символ.
- В seq2seq энкодер сжимает входную строку в состояния $h$ и $c$, декодер разворачивает их в выходную строку.
- При обучении декодер получает правильный предыдущий символ (teacher forcing); при генерации — свой собственный предыдущий ответ.
- Обучение и генерация — разные режимы: ошибка на обучении не равна качеству генерации, а оценка на обучающих примерах не заменяет отложенную выборку.

## Полный разбор

### 1. Данные: алфавит и скользящее окно

Сначала строится отображение символов в целые числа:

```python
import numpy as np
import tensorflow as tf

np.random.seed(7)

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
char_to_int = dict((c, i) for i, c in enumerate(alphabet))
int_to_char = dict((i, c) for i, c in enumerate(alphabet))
print(char_to_int)
```

`enumerate` проходит по строке и выдаёт пары «индекс, символ». Первый словарь переводит букву в число, второй — обратно. `A` получает 0, `B` — 1, …, `Z` — 25.

Затем нарезаются примеры:

```python
seq_length = 1
dataX = []
dataY = []
for i in range(0, len(alphabet) - seq_length, 1):
    seq_in = alphabet[i:i + seq_length]
    seq_out = alphabet[i + seq_length]
    dataX.append([char_to_int[char] for char in seq_in])
    dataY.append(char_to_int[seq_out])
```

При `seq_length = 1` цикл идёт от 0 до 24. На каждом шаге вход — один символ `alphabet[i]`, цель — следующий `alphabet[i+1]`. Получается 25 пар: `A→B`, `B→C`, …, `Y→Z`. Буква `Z` ни разу не встречается на входе (после неё нет следующей), а `A` ни разу не является целью. Это нормально для задачи «продолжить последовательность»: модель учится на всех переходах, кроме последнего.

Если увеличить `seq_length`, вход станет строкой из нескольких символов, а цель останется одним следующим символом. Так работает языковая модель: по контексту предсказывается следующий токен.

### 2. Форма входа для LSTM

```python
X = np.reshape(dataX, (len(dataX), 1, seq_length))
X = X / float(len(alphabet))
y = np.array(dataY)
print(y)
```

`LSTM` в Keras ожидает трёхмерный тензор: `(число примеров, число временных шагов, число признаков)`. Здесь 25 примеров, один временной шаг и один признак — номер символа. `reshape` добавляет недостающие оси.

Деление на `len(alphabet) = 26` приводит номера к диапазону примерно от 0 до 0.96. Это не one-hot кодирование: `A` и `B` различаются на $1/26$, а `A` и `Z` — почти на единицу. Для сети это означает, что близкие буквы алфавита близки и численно. Иногда это полезно (модель может выучить плавный сдвиг), но чаще для категориальных символов применяют one-hot или обучаемый `Embedding`. Здесь выбран самый простой вариант.

Цель `y` — массив целых чисел от 1 до 25. Класс 0 (`A`) в цели не встречается, но выходной слой всё равно делает 26 классов: `int(y.max() + 1)`.

### 3. Модель и число параметров

```python
model = tf.keras.models.Sequential()
model.add(tf.keras.layers.Input((X.shape[1], X.shape[2],)))
model.add(tf.keras.layers.LSTM(32))
model.add(tf.keras.layers.Dense(int(y.max() + 1), activation='softmax'))
model.summary()

tf.keras.utils.plot_model(model, show_shapes=True, show_layer_activations=True)
```

`Input((1, 1))` задаёт форму одного примера: один шаг, один признак. `LSTM(32)` читает последовательность и возвращает вектор скрытого состояния длины 32; по умолчанию `return_sequences=False`, поэтому возвращается только последний шаг. `Dense(26, softmax)` превращает эти 32 числа в 26 вероятностей.

Размер LSTM считается по формуле для одного слоя:

$$
4 \cdot \big((n_{\text{in}} + n_{\text{hidden}}) \cdot n_{\text{hidden}} + n_{\text{hidden}}\big).
$$

При $n_{\text{in}} = 1$ и $n_{\text{hidden}} = 32$:

$$
4 \cdot ((1 + 32) \cdot 32 + 32) = 4 \cdot 1088 = 4352.
$$

Плотный слой: $32 \cdot 26 + 26 = 858$. Итого $4352 + 858 = 5210$ параметров — столько и показывает `model.summary()`. Четыре «копии» весов в LSTM — это четыре гейта: входной, забывания, выходной и кандидат в память.

Устройство ячейки LSTM:

$$
i_t = \sigma(W_i x_t + U_i h_{t-1} + b_i), \qquad
f_t = \sigma(W_f x_t + U_f h_{t-1} + b_f),
$$

$$
o_t = \sigma(W_o x_t + U_o h_{t-1} + b_o), \qquad
\tilde{c}_t = \tanh(W_c x_t + U_c h_{t-1} + b_c),
$$

$$
c_t = f_t \odot c_{t-1} + i_t \odot \tilde{c}_t, \qquad
h_t = o_t \odot \tanh(c_t).
$$

Гейт забывания $f_t$ решает, что стереть из долгой памяти $c_t$; входной гейт $i_t$ — что записать; выходной $o_t$ — что отдать в скрытое состояние $h_t$. Именно долгая память позволяет сигналу не затухать на длинных последовательностях.

### 4. Обучение первой модели

```python
model.compile(loss='sparse_categorical_crossentropy',
              optimizer=tf.keras.optimizers.Adam(learning_rate=0.01),
              metrics=['accuracy'])
model.fit(X, y, epochs=100, batch_size=1)
```

`sparse_categorical_crossentropy` принимает целые метки и сам сравнивает их с распределением вероятностей. Если бы метки были one-hot, использовалась бы `categorical_crossentropy`. `batch_size=1` означает, что веса обновляются после каждого примера: при 25 примерах это 25 шагов на эпоху. Скорость обучения `0.01` для такой маленькой сети довольно высокая; при нестабильном обучении её уменьшают.

В логе ноутбука loss в первых эпохах падает с 3.33 до примерно 2.6, accuracy колеблется около нуля: 25 примеров — слишком мало, чтобы по эпохам делать вывод. К концу обучения сеть частично выучивает переходы.

### 5. Оценка и предсказания

```python
from sklearn.metrics import confusion_matrix, classification_report
yp = model.predict(X)
yp = np.argmax(yp, axis=1)

print(classification_report(y, yp))
print(confusion_matrix(y, yp))
```

`model.predict` возвращает матрицу вероятностей $25 \times 26$. `argmax(axis=1)` выбирает номер самого вероятного класса в каждой строке. `classification_report` сравнивает истинные метки `y` с предсказанными `yp`.

В отчёте у каждого класса `support = 1`: в выборке ровно один пример на каждый переход. При таком support precision и recall принимают только значения 0, 0.5 или 1 и мало что говорят. Некоторые классы вообще не встречаются среди предсказаний — для них precision не определена и sklearn выдаёт предупреждение `UndefinedMetricWarning`, подставляя 0. Это не поломка, а следствие крошечной выборки.

Ручная проверка показывает картину лучше:

```python
for pattern in dataX:
    x = np.reshape(pattern, (1, 1, len(pattern)))
    x = x / float(len(alphabet))
    prediction = model.predict(x, verbose=0)
    index = np.argmax(prediction)
    result = int_to_char[index]
    seq_in = [int_to_char[value] for value in pattern]
    print(seq_in, "->", result)
```

Вывод начинается так:

```text
['A'] -> B
['B'] -> B
['C'] -> D
['D'] -> E
['E'] -> F
['F'] -> G
['G'] -> H
['H'] -> J
['I'] -> K
['J'] -> K
['K'] -> L
['L'] -> N
['M'] -> N
['N'] -> O
['O'] -> O
['P'] -> Q
...
```

Часть переходов верна, часть сдвинута на одну-две буквы. Ошибки не случайны: сеть путает соседние символы, потому что вход закодирован числом, и близкие номера дают близкие сигналы. Для задачи «следующая буква» это ожидаемо: идеальной модели здесь мешает и маленькая выборка, и отсутствие one-hot кодирования, и высокая скорость обучения.

### 6. Вторая задача: «переводчик» чисел

Вторая часть ноутбука — seq2seq. Данные генерируются программно:

```python
batch_size, epochs, latent_dim, num_samples = 64, 100, 256, 10000

input_texts, target_texts = [], []
import random

for line in range(10000):
    d = random.randint(1, 1000)
    input_texts.append(str(d**2 + 1))
    target_texts.append('\t' + str(d) + '\n')

input_characters = sorted(set(list(' 0123456789')))
target_characters = sorted(set(list(' 0123456789 \n\t')))
```

Вход — число $d^2 + 1$, выход — число $d$. То есть сеть должна научиться обратному преобразованию: по квадрату, увеличенному на единицу, восстановить основание. Это не перевод с языка на язык, но структура задачи та же: последовательность на входе, последовательность на выходе, разной длины.

`random.randint(1, 1000)` вызывается без `random.seed`, поэтому набор данных при каждом запуске разный. В ноутбуке зафиксирован только `np.random.seed(7)`, который не влияет на модуль `random`.

Словари символов:

```python
num_encoder_tokens = len(input_characters)          # 11
num_decoder_tokens = len(target_characters)         # 13
max_encoder_seq_length = max(len(txt) for txt in input_texts)
max_decoder_seq_length = max(len(txt) for txt in target_texts)

input_token_index = {c: i for i, c in enumerate(input_characters)}
target_token_index = {c: i for i, c in enumerate(target_characters)}
reverse_input_char_index = {i: c for c, i in input_token_index.items()}
reverse_target_char_index = {i: c for c, i in target_token_index.items()}
```

Во входном алфавите 11 символов: пробел и цифры 0–9. Пробел нужен для выравнивания строк до одной длины. В целевом алфавите 13 символов: добавляются табуляция (стартовый токен) и перевод строки (стоп-токен).

### 7. One-hot кодирование и teacher forcing

```python
encoder_input_data = np.zeros((len(input_texts), max_encoder_seq_length,
                               num_encoder_tokens), dtype='float32')
decoder_input_data = np.zeros((len(input_texts), max_decoder_seq_length,
                               num_decoder_tokens), dtype='float32')
decoder_target_data = np.zeros((len(input_texts), max_decoder_seq_length,
                                num_decoder_tokens), dtype='float32')

for i, (input_text, target_text) in enumerate(zip(input_texts, target_texts)):
    for t, char in enumerate(input_text):
        encoder_input_data[i, t, input_token_index[char]] = 1.
    encoder_input_data[i, t + 1:, input_token_index[' ']] = 1.

    for t, char in enumerate(target_text):
        decoder_input_data[i, t, target_token_index[char]] = 1.
        if t > 0:
            decoder_target_data[i, t - 1, target_token_index[char]] = 1.
    decoder_input_data[i, t + 1:, target_token_index[' ']] = 1.
    decoder_target_data[i, t:, target_token_index[' ']] = 1.
```

Каждый символ превращается в вектор длины 11 или 13, где стоит одна единица, остальные нули. Пустые позиции в конце строки заполняются единицей в позиции пробела — это padding, чтобы все примеры имели одинаковую длину.

Ключевой момент — сдвиг целевой последовательности. `decoder_input_data` содержит символы ответа как есть, начиная с `\t`. `decoder_target_data` записывает символ с индексом `t` в позицию `t - 1`. Поэтому на позиции 0 декодер видит `\t` и должен предсказать первую цифру; на позиции 1 видит первую цифру и предсказывает вторую, и так далее. Это и есть **teacher forcing**: при обучении на каждом шаге подаётся правильный предыдущий символ, а не собственный прогноз. Так обучение распараллеливается по времени и не накапливает ранние ошибки.

### 8. Архитектура seq2seq

```python
encoder_inputs = tf.keras.layers.Input(shape=(None, num_encoder_tokens))
encoder = tf.keras.layers.LSTM(latent_dim, return_state=True)
encoder_outputs, state_h, state_c = encoder(encoder_inputs)
encoder_states = [state_h, state_c]

decoder_inputs = tf.keras.layers.Input(shape=(None, num_decoder_tokens))
decoder_lstm = tf.keras.layers.LSTM(latent_dim, return_sequences=True,
                                    return_state=True)
decoder_outputs, _, _ = decoder_lstm(decoder_inputs,
                                     initial_state=encoder_states)
decoder_dense = tf.keras.layers.Dense(num_decoder_tokens,
                                      activation="softmax")
decoder_outputs = decoder_dense(decoder_outputs)

model = tf.keras.models.Model(inputs=[encoder_inputs, decoder_inputs],
                              outputs=[decoder_outputs])
```

Энкодер читает входную строку и возвращает два состояния: $h$ (скрытое) и $c$ (долгую память). `return_state=True` нужен именно для этого; сам выход энкодера (`encoder_outputs`) здесь не используется.

Декодер — отдельный LSTM с `return_sequences=True`: он выдаёт вектор на каждом временном шаге, потому что предсказание нужно для каждого символа. Его начальное состояние — состояния энкодера. Это главная идея seq2seq: вход сжат в вектор, с которого декодер начинает порождать выход.

`Dense(13, softmax)` применяется к каждому шагу и даёт распределение по символам. Модель обучается на паре «энкодерный вход + сдвинутый декодерный вход» → «сдвинутые цели».

Число параметров:

- энкодер: $4 \cdot ((11 + 256) \cdot 256 + 256) = 274\,432$;
- декодер: $4 \cdot ((13 + 256) \cdot 256 + 256) = 276\,480$;
- выходной слой: $256 \cdot 13 + 13 = 3341$.

Итого $274\,432 + 276\,480 + 3341 = 554\,253$ — совпадает с `model.summary()`.

### 9. Обучение seq2seq

```python
model.compile(optimizer='rmsprop', loss='categorical_crossentropy',
              metrics=['accuracy'])
es = tf.keras.callbacks.EarlyStopping(monitor='val_accuracy', mode='max',
                                      patience=3)
model.fit([encoder_input_data, decoder_input_data], decoder_target_data,
          batch_size=batch_size, epochs=epochs,
          validation_split=0.2, callbacks=[es])
model.save("s2s.keras")
```

Здесь метки — one-hot тензоры, поэтому используется `categorical_crossentropy`, а не `sparse_...`. `validation_split=0.2` откладывает 20% примеров для контроля. `EarlyStopping` следит за `val_accuracy`, останавливается, если она не улучшается 3 эпохи подряд. В логе ноутбука `val_accuracy` быстро растёт: 0.8142 после первой эпохи, 0.9822 после четвёртой, 0.9999 после восьмой. Loss на обучении падает с 1.30 до 0.0156.

Тонкость: `restore_best_weights` по умолчанию равно `False`. Значит, после остановки остаются веса последней эпохи, а не лучшей. Если нужна именно лучшая модель, параметр включают явно. Сохранение `s2s.keras` фиксирует то состояние, которое было на момент остановки.

### 10. Модели для генерации

Обученная модель принимает весь декодерный вход целиком, а для генерации нужен пошаговый режим. Поэтому из неё собираются две отдельные модели:

```python
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input

model = tf.keras.models.load_model("s2s.keras")

encoder_inputs = model.input[0]
encoder_outputs, state_h_enc, state_c_enc = model.layers[2].output
encoder_states = [state_h_enc, state_c_enc]
encoder_model = Model(encoder_inputs, encoder_states)

decoder_inputs = model.input[1]
decoder_state_input_h = Input(shape=(latent_dim,))
decoder_state_input_c = Input(shape=(latent_dim,))
decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]

decoder_lstm = model.layers[3]
decoder_outputs, state_h_dec, state_c_dec = decoder_lstm(
    decoder_inputs, initial_state=decoder_states_inputs)
decoder_states = [state_h_dec, state_c_dec]

decoder_dense = model.layers[4]
decoder_outputs = decoder_dense(decoder_outputs)

decoder_model = tf.keras.Model(
    [decoder_inputs] + decoder_states_inputs,
    [decoder_outputs] + decoder_states)
```

`encoder_model` принимает строку и возвращает $h$ и $c$. `decoder_model` принимает один токен и предыдущие состояния, возвращает распределение на текущем шаге и новые состояния.

Индексы `model.layers[2]`, `[3]`, `[4]` — это энкодерный LSTM, декодерный LSTM и выходной `Dense` в исходной функциональной модели. Такой способ работает, но хрупок: стоит изменить архитектуру или порядок слоёв, и индексы укажут на другие объекты. Надёжнее давать слоям имена и обращаться по ним.

### 11. Жадная генерация

```python
def decode_sequence(input_seq):
    states_value = encoder_model.predict(input_seq, verbose=False)

    target_seq = np.zeros((1, 1, num_decoder_tokens))
    target_seq[0, 0, target_token_index['\t']] = 1.

    stop_condition = False
    decoded_sentence = ''
    while not stop_condition:
        output_tokens, h, c = decoder_model.predict(
            [target_seq] + states_value, verbose=False)

        sampled_token_index = np.argmax(output_tokens[0, -1, :])
        sampled_char = reverse_target_char_index[sampled_token_index]
        decoded_sentence += sampled_char

        if (sampled_char == '\n' or
                len(decoded_sentence) > max_decoder_seq_length):
            stop_condition = True

        target_seq = np.zeros((1, 1, num_decoder_tokens))
        target_seq[0, 0, sampled_token_index] = 1.
        states_value = [h, c]

    return decoded_sentence
```

Сначала энкодер сжимает вход в состояния. Затем декодер получает стартовый токен `\t`. На каждом шаге выбирается самый вероятный символ (`argmax`), добавляется к ответу, а его one-hot вектор подаётся на следующий шаг вместе с обновлёнными состояниями. Цикл останавливается на переводе строки или при превышении максимальной длины. Это **жадная** генерация: на каждом шаге берётся один лучший символ, без перебора вариантов.

### 12. Результаты

```python
for seq_index in range(20):
    input_seq = encoder_input_data[seq_index: seq_index + 1]
    decoded_sentence = decode_sequence(input_seq)
    print(input_texts[seq_index], '->', decoded_sentence)
```

Вывод:

```text
192722 -> 439
25601 -> 160
412165 -> 642
177242 -> 421
350465 -> 592
664226 -> 815
257050 -> 507
399425 -> 632
297026 -> 545
409601 -> 640
521285 -> 722
198026 -> 445
52901 -> 230
53362 -> 231
211601 -> 460
299210 -> 547
608401 -> 780
6401 -> 80
891137 -> 944
214370 -> 463
```

Проверим несколько ответов: $439^2 + 1 = 192721 + 1 = 192722$; $160^2 + 1 = 25601$; $642^2 + 1 = 412165$; $80^2 + 1 = 6401$; $944^2 + 1 = 891137$. Все двадцать примеров совпали с истинным $d$.

Но интерпретировать это как «сеть выучила обратный квадрат» надо осторожно. Во-первых, $d$ выбирается из 1000 значений, а примеров 10000: каждое значение встречается в среднем десять раз, поэтому модель может запомнить таблицу, а не правило. Во-вторых, первые 20 примеров берутся из того же набора, на котором училась модель: отдельного теста нет, часть данных ушла только в `validation_split`. Для честной проверки нужно сгенерировать новые $d$, которых не было при обучении.

## Код

Основной код первой части:

```python
import numpy as np
import tensorflow as tf

np.random.seed(7)

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
char_to_int = {c: i for i, c in enumerate(alphabet)}
int_to_char = {i: c for i, c in enumerate(alphabet)}

seq_length = 1
dataX, dataY = [], []
for i in range(0, len(alphabet) - seq_length, 1):
    seq_in = alphabet[i:i + seq_length]
    seq_out = alphabet[i + seq_length]
    dataX.append([char_to_int[char] for char in seq_in])
    dataY.append(char_to_int[seq_out])

X = np.reshape(dataX, (len(dataX), 1, seq_length))
X = X / float(len(alphabet))
y = np.array(dataY)

model = tf.keras.models.Sequential()
model.add(tf.keras.layers.Input((X.shape[1], X.shape[2],)))
model.add(tf.keras.layers.LSTM(32))
model.add(tf.keras.layers.Dense(int(y.max() + 1), activation='softmax'))
model.summary()

model.compile(loss='sparse_categorical_crossentropy',
              optimizer=tf.keras.optimizers.Adam(learning_rate=0.01),
              metrics=['accuracy'])
model.fit(X, y, epochs=100, batch_size=1)

from sklearn.metrics import confusion_matrix, classification_report
yp = np.argmax(model.predict(X), axis=1)
print(classification_report(y, yp))
print(confusion_matrix(y, yp))
```

Код seq2seq:

```python
import random
import numpy as np
import tensorflow as tf

batch_size, epochs, latent_dim = 64, 100, 256
input_texts, target_texts = [], []

for line in range(10000):
    d = random.randint(1, 1000)
    input_texts.append(str(d**2 + 1))
    target_texts.append('\t' + str(d) + '\n')

input_characters = sorted(set(list(' 0123456789')))
target_characters = sorted(set(list(' 0123456789 \n\t')))

num_encoder_tokens = len(input_characters)
num_decoder_tokens = len(target_characters)
max_encoder_seq_length = max(len(t) for t in input_texts)
max_decoder_seq_length = max(len(t) for t in target_texts)

input_token_index = {c: i for i, c in enumerate(input_characters)}
target_token_index = {c: i for i, c in enumerate(target_characters)}
reverse_target_char_index = {i: c for c, i in target_token_index.items()}

encoder_input_data = np.zeros(
    (len(input_texts), max_encoder_seq_length, num_encoder_tokens),
    dtype='float32')
decoder_input_data = np.zeros(
    (len(input_texts), max_decoder_seq_length, num_decoder_tokens),
    dtype='float32')
decoder_target_data = np.zeros(
    (len(input_texts), max_decoder_seq_length, num_decoder_tokens),
    dtype='float32')

for i, (input_text, target_text) in enumerate(zip(input_texts, target_texts)):
    for t, char in enumerate(input_text):
        encoder_input_data[i, t, input_token_index[char]] = 1.
    encoder_input_data[i, t + 1:, input_token_index[' ']] = 1.

    for t, char in enumerate(target_text):
        decoder_input_data[i, t, target_token_index[char]] = 1.
        if t > 0:
            decoder_target_data[i, t - 1, target_token_index[char]] = 1.
    decoder_input_data[i, t + 1:, target_token_index[' ']] = 1.
    decoder_target_data[i, t:, target_token_index[' ']] = 1.

encoder_inputs = tf.keras.layers.Input(shape=(None, num_encoder_tokens))
encoder = tf.keras.layers.LSTM(latent_dim, return_state=True)
encoder_outputs, state_h, state_c = encoder(encoder_inputs)
encoder_states = [state_h, state_c]

decoder_inputs = tf.keras.layers.Input(shape=(None, num_decoder_tokens))
decoder_lstm = tf.keras.layers.LSTM(latent_dim, return_sequences=True,
                                    return_state=True)
decoder_outputs, _, _ = decoder_lstm(decoder_inputs,
                                     initial_state=encoder_states)
decoder_dense = tf.keras.layers.Dense(num_decoder_tokens,
                                      activation="softmax")
decoder_outputs = decoder_dense(decoder_outputs)

model = tf.keras.models.Model(inputs=[encoder_inputs, decoder_inputs],
                              outputs=[decoder_outputs])
model.compile(optimizer='rmsprop', loss='categorical_crossentropy',
              metrics=['accuracy'])
es = tf.keras.callbacks.EarlyStopping(monitor='val_accuracy', mode='max',
                                      patience=3)
model.fit([encoder_input_data, decoder_input_data], decoder_target_data,
          batch_size=batch_size, epochs=epochs,
          validation_split=0.2, callbacks=[es])
model.save("s2s.keras")
```

### Что делает код

Первый блок строит 25 пар «буква → следующая буква», кодирует вход числом и делит на 26, обучает LSTM на 32 скрытых нейрона с `softmax` на 26 выходов. Второй генерирует 10000 примеров «квадрат плюс один → основание», кодирует строки one-hot, собирает энкодер и декодер через функциональный API, обучает с teacher forcing и сохраняет модель.

`return_state=True` у энкодера нужен, чтобы получить $h$ и $c$; `return_sequences=True` у декодера — чтобы получить выход на каждом шаге. `categorical_crossentropy` сравнивает распределения по 13 символам, `sparse_categorical_crossentropy` в первой задаче — целые метки с распределением по 26.

## Формулы

| Величина | Формула | Смысл |
| --- | --- | --- |
| Softmax | $p_k = \frac{e^{z_k}}{\sum_j e^{z_j}}$ | Превращает логиты в вероятности по классам |
| Кросс-энтропия | $L = -\sum_k y_k \log p_k$ | Штраф за низкую вероятность правильного класса |
| Гейт LSTM | $i_t = \sigma(W_i x_t + U_i h_{t-1} + b_i)$ | Решает, что записать в память |
| Память LSTM | $c_t = f_t \odot c_{t-1} + i_t \odot \tilde{c}_t$ | Долгая память с забыванием и записью |
| Выход LSTM | $h_t = o_t \odot \tanh(c_t)$ | Скрытое состояние на текущем шаге |
| Параметры LSTM | $4((n_{\text{in}} + n_{\text{hidden}})n_{\text{hidden}} + n_{\text{hidden}})$ | Для $1 \to 32$: 4352 |
| Параметры Dense | $n_{\text{in}} \cdot n_{\text{out}} + n_{\text{out}}$ | Для $32 \to 26$: 858 |
| Генерация | $\hat{y}_t = \arg\max_k p(y_t = k \mid \hat{y}_{<t}, \text{state})$ | Жадный выбор следующего символа |

## Задание / практика

Нужно было воспроизвести две задачи.

1. **Следующий символ.** Построить пары `A→B, B→C, …, Y→Z`, обучить `LSTM(32) + Dense(26, softmax)` с `sparse_categorical_crossentropy`, затем вывести `classification_report`, матрицу ошибок и таблицу предсказаний для всех 25 входов. Результат — частично верные переходы, ошибки в основном на соседних буквах.
2. **Seq2seq.** Сгенерировать 10000 пар «$d^2+1$ → $d$», закодировать строки one-hot, собрать энкодер-декодер с `latent_dim=256`, обучить с `validation_split=0.2` и `EarlyStopping`, сохранить `s2s.keras`, собрать модели для инференса и сгенерировать ответы для первых 20 примеров. Результат — все 20 ответов совпали с истинным $d$.

Дополнительно стоит проверить: что будет при `seq_length=3`; как меняются предсказания, если кодировать буквы one-hot; сохранится ли качество seq2seq на новых $d$, которых не было в обучении.

## Что спросят

**Почему вход LSTM трёхмерный?**
Keras ждёт `(samples, timesteps, features)`: число примеров, длина последовательности и размер вектора признаков на каждом шаге. В первой задаче это `(25, 1, 1)`.

**Зачем `return_state=True` у энкодера?**
Чтобы получить скрытое состояние $h$ и долгую память $c$ и передать их декодеру как начальное состояние. Без этого декодер не знал бы, что было во входе.

**Что такое teacher forcing?**
При обучении декодер получает правильный предыдущий символ, а не свой прогноз. Это ускоряет и стабилизирует обучение, но создаёт разрыв между обучением и генерацией.

**Почему при генерации используется `argmax`, а не sampling?**
Это жадная стратегия: на каждом шаге берётся самый вероятный символ. Она детерминирована, но может застревать в повторяющихся фразах; sampling добавляет случайность.

**Чем `sparse_categorical_crossentropy` отличается от `categorical_crossentropy`?**
Первая принимает целые номера классов, вторая — one-hot векторы. Математически это одна и та же кросс-энтропия.

**Почему в первой задаче quality невысокое?**
Мало данных (25 примеров), грубое числовое кодирование букв вместо one-hot, высокая скорость обучения. Сеть путает соседние буквы, потому что их номера близки.

**Почему нельзя утверждать, что seq2seq выучил обратный квадрат?**
Ответы проверены на обучающих примерах, а $d$ принимает всего 1000 значений при 10000 примерах. Модель могла запомнить таблицу; нужен тест на новых $d$.

**Что делает `EarlyStopping` и что важно про `restore_best_weights`?**
Останавливает обучение, когда метрика не улучшается `patience` эпох. По умолчанию `restore_best_weights=False`, поэтому сохраняются веса последней эпохи, а не лучшей.

## Связи

- С предыдущей темой: деревья решений работали с табличными признаками фиксированной длины; здесь появляются последовательности и состояние, которое переносится между шагами.
- С другой темой: one-hot и `Embedding` разбираются в практике по word2vec; LSTM — прямой предшественник трансформеров, где роль состояния играет внимание.
- Где это встречается в домашках: языковые модели, генерация текста, предсказание следующего токена, машинный перевод и любые задачи «последовательность на входе — последовательность на выходе».
