import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const navIcons = [
    
        {src: '/assets/icons/search.svg', alt: 'search'},
        {src: '/assets/icons/black-heart.svg', alt: 'heart'},
        {src: '/assets/icons/user.svg', alt: 'user'},
]
const Navbar = () => {
  return (
    <header className='w-full'>
          <nav className='nav'>
              <Link href={'/'} className='flex items-center gap-1'>
                  <Image src={'/assets/icons/logo.svg'} alt={'logo'} width={27}
                      height={27} />
                  
                  <p className='nav-logo'>
                    Alert <span className='text-primary'>Aisle</span>  
                  </p>
              </Link>
              <div className='flex items-center gap-5'>
                  {navIcons.map((icons) =>
                      <Image
                          key={icons.alt}
                          src={icons.src}
                          alt={icons.alt}
                          width={28}
                          height={28}
                          className='object-contain'
                      />
                  )}
              </div>
      </nav>
    </header>
  )
}

export default Navbar
