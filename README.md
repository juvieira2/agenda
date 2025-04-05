# Sistema de Controle da Mãe Rainha

Um aplicativo web para controlar a posse da imagem da Mãe Rainha entre moradores da comunidade.

## Funcionalidades

- Cadastro de informações de transferência da imagem
- Validações para evitar duplicidade de datas de recebimento
- Visualização de registros ordenados por data
- Interface responsiva e intuitiva
- Filtro para localizar a imagem atualmente

## Tecnologias utilizadas

- HTML5
- CSS3 (Bootstrap)
- JavaScript
- Armazenamento local (LocalStorage)
- Flask (servidor Python)

## Como utilizar

1. Preencha o formulário com as informações do novo anfitrião
2. O sistema validará se não existe outra pessoa recebendo a imagem na mesma data
3. Os registros são exibidos em ordem cronológica inversa (mais recentes primeiro)
4. É possível editar ou excluir registros conforme necessário
5. Use o filtro "Localização da Imagem" para visualizar apenas os registros atuais

## Requisitos do formulário

- **Anfitrião**: Apenas letras maiúsculas
- **Apartamento**: Número do apartamento
- **Bloco**: Seleção entre "A" e "B"
- **Data do Recebimento**: Data em que a imagem foi recebida
- **Data da Entrega**: Data prevista para entrega
- **Status**: "Recebido" ou "Aguardando"

## Instalação e execução local

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Entre na pasta do projeto
cd SEU_REPOSITORIO

# Instale as dependências
pip install -r requirements.txt

# Execute a aplicação
python main.py
```

O aplicativo estará disponível em `http://localhost:5000`

## Licença

Este projeto está sob a licença MIT.