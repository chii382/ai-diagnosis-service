'use client';

import { Box, Container, Typography } from '@mui/material';
import Image from 'next/image';
import { motion } from 'motion/react';

export default function PainSection() {
  return (
    <Box
      component="section"
      id="pain"
      sx={{
        py: { xs: 6, md: 8 },
        background: '#fff7ed',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-120px 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            {/* 左側：人物イメージ */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: { xs: 320, md: 420 },
                mx: 'auto',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 18px 45px rgba(15, 23, 42, 0.25)',
              }}
            >
              <Image
                src="/images/pain-person.png"
                alt="キャリアに悩む人のイメージ"
                width={840}
                height={1050}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Box>

            {/* 右側：テキストと悩みリスト */}
            <Box>
              <motion.div
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-120px 0px' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Box
                  sx={{
                    textAlign: { xs: 'center', md: 'left' },
                    mb: { xs: 3.5, md: 4 },
                  }}
                >
                  <Typography
                    variant="h2"
                    component="h2"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 700,
                      color: '#3d2c1e',
                      mb: 1.5,
                    }}
                  >
                    こんなお悩み、ありませんか？
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      color: '#5c4033',
                    }}
                  >
                    もしひとつでも当てはまるなら、今がキャリアを見直すタイミングかもしれません。
                  </Typography>
                </Box>
              </motion.div>

              <motion.div
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-120px 0px' }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: { xs: 2.5, md: 3 },
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '1rem', md: '1.05rem' },
                        fontWeight: 600,
                        color: '#3d2c1e',
                        mb: 0.5,
                      }}
                    >
                      将来のキャリアがなんとなく不安
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        color: '#5c4033',
                      }}
                    >
                      このまま今の仕事を続けていていいのか、数年後の自分がイメージできずモヤモヤしている。
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '1rem', md: '1.05rem' },
                        fontWeight: 600,
                        color: '#3d2c1e',
                        mb: 0.5,
                      }}
                    >
                      自分のスキルや強みがよくわからない
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        color: '#5c4033',
                      }}
                    >
                      何となくできることはあるけれど、「これが自分の武器だ」と自信を持って言えない。
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '1rem', md: '1.05rem' },
                        fontWeight: 600,
                        color: '#3d2c1e',
                        mb: 0.5,
                      }}
                    >
                      今の仕事が自分に合っているのか不安になる
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        color: '#5c4033',
                      }}
                    >
                      仕事自体はこなせているけれど、やりがいや成長実感をあまり感じられていない。
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '1rem', md: '1.05rem' },
                        fontWeight: 600,
                        color: '#3d2c1e',
                        mb: 0.5,
                      }}
                    >
                      自分でも気づいていない可能性を知りたい
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        color: '#5c4033',
                      }}
                    >
                      なんとなく「もっとできるはず」と感じているけれど、そのヒントがどこにあるのかわからない。
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

